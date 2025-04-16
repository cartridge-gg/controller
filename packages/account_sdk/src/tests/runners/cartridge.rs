use anyhow::Error;
use cainome::cairo_serde::CairoSerde;
use hyper::service::{make_service_fn, service_fn};
use hyper::{http::request::Parts, Body, Client, Request, Response, Server, StatusCode};
use serde_json::{json, Value};
use starknet::accounts::single_owner::SignError;
use starknet::accounts::{Account, AccountError, ExecutionEncoding};
use starknet::core::types::{
    BroadcastedInvokeTransaction, BroadcastedTransaction, Call, DataAvailabilityMode, InvokeTransactionResult, ResourceBounds
};
use starknet::macros::selector;
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::JsonRpcClient;
use starknet_crypto::{poseidon_hash_many, Felt};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::Mutex;
use url::Url;

use crate::abigen::controller::{SessionToken, SignerSignature};
use crate::account::outside_execution::OutsideExecution;
use crate::account::session::hash::SessionHash;
use crate::constants::GUARDIAN_SIGNER;
use crate::execute_from_outside::FeeSource;
use crate::hash::MessageHashRev1;
use crate::provider::OutsideExecutionParams;
use crate::signers::HashSigner;

use super::katana::{single_owner_account_with_encoding, PREFUNDED};

pub struct CartridgeProxy {
    chain_id: Felt,
    rpc_url: Url,
    proxy_url: Url,
    rpc_client: JsonRpcClient<HttpTransport>,
    client: Client<hyper::client::HttpConnector>,
}

impl CartridgeProxy {
    pub fn new(rpc_url: Url, proxy_url: Url, chain_id: Felt) -> Self {
        let rpc_client = JsonRpcClient::new(HttpTransport::new(rpc_url.clone()));

        CartridgeProxy {
            chain_id,
            rpc_url,
            rpc_client,
            proxy_url,
            client: Client::new(),
        }
    }

    pub async fn run(self) {
        let proxy_addr: SocketAddr = self
            .proxy_url
            .socket_addrs(|| None)
            .expect("Failed to resolve proxy URL")
            .into_iter()
            .next()
            .expect("No socket addresses found for proxy URL");

        let shared_self = Arc::new(Mutex::new(self));

        let make_svc = make_service_fn(move |_conn| {
            let shared_self = shared_self.clone();
            async move {
                Ok::<_, hyper::Error>(service_fn(move |req| {
                    let shared_self = shared_self.clone();
                    async move {
                        let self_guard = shared_self.lock().await;
                        self_guard.handle_request(req).await
                    }
                }))
            }
        });

        let server = Server::bind(&proxy_addr).serve(make_svc);
        if let Err(e) = server.await {
            eprintln!("server error: {}", e);
        }
    }

    async fn handle_request(&self, req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
        let (mut parts, body) = req.into_parts();
        let body_bytes = hyper::body::to_bytes(body).await?;
        let mut body: Value = serde_json::from_slice(&body_bytes).unwrap_or(json!({}));

        if let Some(method) = body.get("method") {
            if method == "cartridge_addExecuteOutsideTransaction" {
                return self.handle_add_execute_outside_transaction(&body).await;
            } else if method == "starknet_addInvokeTransaction" {
                self.handle_add_invoke_transaction(&mut parts, &mut body)
                    .await;
            } else if method == "starknet_estimateFee" {
                self.handle_estimate_fee(&mut parts, &mut body).await;
            }
        }

        let body = Body::from(serde_json::to_vec(&body).unwrap());

        let mut proxy_req = Request::builder()
            .method(parts.method)
            .uri(&self.rpc_url.to_string())
            .body(body)
            .unwrap();

        *proxy_req.headers_mut() = parts.headers;

        self.client.request(proxy_req).await
    }

    async fn handle_add_invoke_transaction(&self, parts: &mut Parts, body: &mut Value) {
        let mut txs: Vec<BroadcastedTransaction> =
            serde_json::from_value(body["params"].clone()).unwrap();

        for tx in &mut txs {
            if let BroadcastedTransaction::Invoke(ref mut tx) = tx {
                let tx_hash = self.transaction_hash(tx);
                tx.signature = self
                    .add_guardian_signature(tx.sender_address, tx_hash, &tx.signature)
                    .await;
            }
        }
        body["params"] = serde_json::to_value(txs).unwrap();
        parts.headers.remove("content-length");
    }

    async fn handle_estimate_fee(&self, parts: &mut Parts, body: &mut Value) {
        let mut txs: Vec<BroadcastedTransaction> =
            serde_json::from_value(body["params"][0].clone()).unwrap();

        for tx in &mut txs {
            if let BroadcastedTransaction::Invoke(ref mut tx) = tx {
                if tx.signature.is_empty() {
                    continue;
                }
                let tx_hash = self.transaction_hash(tx);
                tx.signature = self
                    .add_guardian_signature(tx.sender_address, tx_hash, &tx.signature)
                    .await;
            }
        }
        body["params"][0] = serde_json::to_value(txs).unwrap();
        parts.headers.remove("content-length");
    }

    async fn add_guardian_signature(
        &self,
        address: Felt,
        tx_hash: Felt,
        old_signature: &[Felt],
    ) -> Vec<Felt> {
        match <Vec<SignerSignature> as CairoSerde>::cairo_deserialize(old_signature, 0) {
            Ok(mut signature) => {
                let guardian_signature = GUARDIAN_SIGNER.sign(&tx_hash).await.unwrap();
                signature.push(guardian_signature);
                <Vec<SignerSignature> as CairoSerde>::cairo_serialize(&signature)
            }
            Err(_) => {
                let mut session_token =
                    <SessionToken as CairoSerde>::cairo_deserialize(old_signature, 1).unwrap();
                let session_token_hash = session_token
                    .session
                    .hash(self.chain_id, address, tx_hash)
                    .unwrap();

                // This is different from the transaction signature
                self.add_guardian_authorization(&mut session_token, address)
                    .await;

                let guardian_signature = GUARDIAN_SIGNER.sign(&session_token_hash).await.unwrap();
                session_token.guardian_signature = guardian_signature;

                let mut serialized = <SessionToken as CairoSerde>::cairo_serialize(&session_token);
                serialized.insert(0, old_signature[0]);
                serialized
            }
        }
    }

    async fn add_guardian_authorization(&self, session_token: &mut SessionToken, address: Felt) {
        if session_token.session_authorization.len() == 2 {
            // Authorization by registered
            return;
        }
        let authorization = <Vec<SignerSignature> as CairoSerde>::cairo_deserialize(
            &session_token.session_authorization,
            0,
        )
        .unwrap();
        if authorization.len() == 1 {
            let session_hash = session_token
                .session
                .get_message_hash_rev_1(self.chain_id, address);
            let guardian_authorization = GUARDIAN_SIGNER.sign(&session_hash).await.unwrap();
            session_token.session_authorization =
                <Vec<SignerSignature> as CairoSerde>::cairo_serialize(&vec![
                    authorization[0].clone(),
                    guardian_authorization,
                ]);
        }
    }

    async fn handle_add_execute_outside_transaction(
        &self,
        body: &Value,
    ) -> Result<Response<Body>, hyper::Error> {
        let params = &body["params"];
        let result = match parse_execute_outside_transaction_params(params) {
            Ok((address, outside_execution, signature, _)) => {
                match self
                    .execute_from_outside(outside_execution, signature, address)
                    .await
                {
                    Ok(result) => {
                        println!("success");
                        Response::builder()
                            .status(StatusCode::OK)
                            .body(Body::from(
                                json!({
                                    "id" : 1_u64,
                                    "jsonrpc": "2.0",
                                    "result" : {
                                        "transaction_hash": format!("0x{:x}", result.transaction_hash)
                                    }
                                })
                                .to_string(),
                            ))
                            .unwrap()
                    }
                    Err(e) => {
                        let error_response = json!({
                            "jsonrpc": "2.0",
                            "error": {
                                "code": -32000,
                                "message": "Execution error",
                                "data": e.to_string()
                            }
                        });

                        Response::builder()
                            .status(StatusCode::OK)
                            .header("Content-Type", "application/json")
                            .body(Body::from(error_response.to_string()))
                            .unwrap()
                    }
                }
            }
            Err(e) => {
                let error_response = json!({
                    "jsonrpc": "2.0",
                    "id": body["id"],
                    "error": {
                        "code": -32602,
                        "message": e.to_string()
                    }
                });
                Response::builder()
                    .status(StatusCode::OK)
                    .header("Content-Type", "application/json")
                    .body(Body::from(error_response.to_string()))
                    .unwrap()
            }
        };
        Ok(result)
    }

    async fn execute_from_outside(
        &self,
        outside_execution: OutsideExecution,
        signature: Vec<Felt>,
        contract_address: Felt,
    ) -> Result<
        InvokeTransactionResult,
        AccountError<SignError<starknet::signers::local_wallet::SignError>>,
    > {
        let outside_execution_hash =
            outside_execution.get_message_hash_rev_1(self.chain_id, contract_address);
        let signature = self
            .add_guardian_signature(contract_address, outside_execution_hash, &signature)
            .await;
        let mut calldata = <OutsideExecution as CairoSerde>::cairo_serialize(&outside_execution);
        calldata.extend(<Vec<Felt> as CairoSerde>::cairo_serialize(&signature));

        let call = Call {
            to: contract_address,
            selector: selector!("execute_from_outside_v3"),
            calldata,
        };

        let executor = single_owner_account_with_encoding(
            &self.rpc_client,
            PREFUNDED.0.clone(),
            PREFUNDED.1,
            self.chain_id,
            ExecutionEncoding::New,
        );

        executor.execute_v3(vec![call]).send().await
    }

    pub fn transaction_hash(&self, tx: &BroadcastedInvokeTransaction) -> Felt {
        compute_invoke_v3_tx_hash(
            tx.sender_address,
            &tx.calldata,
            tx.tip,
            &tx.resource_bounds.l1_gas,
            &tx.resource_bounds.l2_gas,
            &tx.resource_bounds.l1_data_gas,
            &tx.paymaster_data,
            self.chain_id,
            tx.nonce,
            &tx.nonce_data_availability_mode,
            &tx.fee_data_availability_mode,
            &tx.account_deployment_data,
            tx.is_query,
        )
    }
}

/// Compute the hash of a V3 Invoke transaction.
#[allow(clippy::too_many_arguments)]
fn compute_invoke_v3_tx_hash(
    sender_address: Felt,
    calldata: &[Felt],
    tip: u64,
    l1_gas_bounds: &ResourceBounds,
    l2_gas_bounds: &ResourceBounds,
    l1_data_gas_bounds: &ResourceBounds,
    paymaster_data: &[Felt],
    chain_id: Felt,
    nonce: Felt,
    nonce_da_mode: &DataAvailabilityMode,
    fee_da_mode: &DataAvailabilityMode,
    account_deployment_data: &[Felt],
    is_query: bool,
) -> Felt {
	/// Cairo string for "invoke"
    const PREFIX_INVOKE: Felt = Felt::from_raw([
        513398556346534256,
        18446744073709551615,
        18446744073709551615,
        18443034532770911073,
    ]);

    /// 2^ 128
    const QUERY_VERSION_OFFSET: Felt =
        Felt::from_raw([576460752142434320, 18446744073709551584, 17407, 18446744073700081665]);

    poseidon_hash_many(&[
        PREFIX_INVOKE,
        if is_query { QUERY_VERSION_OFFSET + Felt::THREE } else { Felt::THREE }, // version
        sender_address,
        hash_fee_fields(tip, l1_gas_bounds, l2_gas_bounds, l1_data_gas_bounds),
        poseidon_hash_many(paymaster_data),
        chain_id,
        nonce,
        encode_da_mode(nonce_da_mode, fee_da_mode),
        poseidon_hash_many(account_deployment_data),
        poseidon_hash_many(calldata),
    ])
}

fn hash_fee_fields(
    tip: u64,
    l1_gas_bounds: &ResourceBounds,
    l2_gas_bounds: &ResourceBounds,
    l1_data_gas_bounds: &ResourceBounds,
) -> Felt {
    poseidon_hash_many(&[
        tip.into(),
        encode_gas_bound(b"L1_GAS", l1_gas_bounds),
        encode_gas_bound(b"L2_GAS", l2_gas_bounds),
        encode_gas_bound(b"L1_DATA_GAS", l1_data_gas_bounds),
    ])
}

fn encode_gas_bound(name: &[u8], bound: &ResourceBounds) -> Felt {
    let mut buffer = [0u8; 32];
    let (remainder, max_price) = buffer.split_at_mut(128 / 8);
    let (gas_kind, max_amount) = remainder.split_at_mut(64 / 8);

    let padding = gas_kind.len() - name.len();
    gas_kind[padding..].copy_from_slice(name);
    max_amount.copy_from_slice(&bound.max_amount.to_be_bytes());
    max_price.copy_from_slice(&bound.max_price_per_unit.to_be_bytes());

    Felt::from_bytes_be(&buffer)
}

fn encode_da_mode(
    nonce_da_mode: &DataAvailabilityMode,
    fee_da_mode: &DataAvailabilityMode,
) -> Felt {
    let nonce = (*nonce_da_mode as u64) << 32;
    let fee = *fee_da_mode as u64;
    Felt::from(nonce + fee)
}

fn parse_execute_outside_transaction_params(
    params: &Value,
) -> Result<(Felt, OutsideExecution, Vec<Felt>, Option<FeeSource>), Error> {
    let OutsideExecutionParams {
        address,
        outside_execution,
        signature,
        fee_source,
    } = serde_json::from_value(params.clone())?;

    Ok((address, outside_execution, signature, fee_source))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::Path;
    use std::str::FromStr;

    fn read_json_file(file_path: &str) -> Value {
        let path = Path::new(file_path);
        let contents = fs::read_to_string(path).expect("Unable to read file");
        serde_json::from_str(&contents).expect("Unable to parse JSON")
    }

    fn test_parse_execute_outside_transaction(file_path: &str) {
        let json_data = read_json_file(file_path);
        let params = &json_data["params"];

        let result = parse_execute_outside_transaction_params(params);
        if let Err(e) = result {
            panic!("Error parsing execute outside transaction: {}", e);
        }

        let (address, outside_execution, signature, _) = result.unwrap();

        // Assert address
        let expected_address = Felt::from_str(params["address"].as_str().unwrap()).unwrap();
        assert_eq!(address, expected_address, "Address mismatch");

        // Assert outside_execution
        let expected_caller =
            Felt::from_str(params["outside_execution"]["caller"].as_str().unwrap()).unwrap();
        assert_eq!(
            outside_execution.caller(),
            expected_caller.into(),
            "Caller mismatch"
        );

        // Assert signature length
        let expected_signature_len = params["signature"].as_array().unwrap().len();
        assert_eq!(
            signature.len(),
            expected_signature_len,
            "Signature length mismatch"
        );
    }

    #[test]
    fn test_parse_session_execute_outside_transaction() {
        test_parse_execute_outside_transaction(
            "src/tests/runners/test_data/session_execute_outside.json",
        );
    }

    #[test]
    fn test_parse_webauthn_execute_outside_transaction() {
        test_parse_execute_outside_transaction(
            "src/tests/runners/test_data/webauthn_execute_outside.json",
        );
    }
}
