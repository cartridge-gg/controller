use anyhow::Error;
use cainome::cairo_serde::CairoSerde;
use hyper::service::{make_service_fn, service_fn};
use hyper::{http::request::Parts, Body, Client, Request, Response, Server, StatusCode};
use serde_json::{json, Value};
use starknet::accounts::single_owner::SignError;
use starknet::accounts::{Account, AccountError, ExecutionEncoding};
use starknet::core::crypto::compute_hash_on_elements;
use starknet::core::types::{
    BroadcastedInvokeTransaction, BroadcastedInvokeTransactionV1, BroadcastedTransaction, Call,
    InvokeTransactionResult,
};
use starknet::macros::selector;
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::JsonRpcClient;
use starknet_crypto::Felt;
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
            if let BroadcastedTransaction::Invoke(BroadcastedInvokeTransaction::V1(ref mut tx)) = tx
            {
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
            if let BroadcastedTransaction::Invoke(BroadcastedInvokeTransaction::V1(ref mut tx)) = tx
            {
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

    pub fn transaction_hash(&self, tx: &BroadcastedInvokeTransactionV1) -> Felt {
        /// Cairo string for "invoke"
        const PREFIX_INVOKE: Felt = Felt::from_raw([
            513398556346534256,
            18446744073709551615,
            18446744073709551615,
            18443034532770911073,
        ]);

        /// 2 ^ 128 + 1
        const QUERY_VERSION_ONE: Felt = Felt::from_raw([
            576460752142433776,
            18446744073709551584,
            17407,
            18446744073700081633,
        ]);
        compute_hash_on_elements(&[
            PREFIX_INVOKE,
            if tx.is_query {
                QUERY_VERSION_ONE
            } else {
                Felt::ONE
            }, // version
            tx.sender_address,
            Felt::ZERO, // entry_point_selector
            compute_hash_on_elements(&tx.calldata),
            tx.max_fee,
            self.chain_id,
            tx.nonce,
        ])
    }
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
