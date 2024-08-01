use cainome::cairo_serde::CairoSerde;
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Client, Request, Response, Server, StatusCode};
use serde_json::{json, Value};
use starknet::accounts::single_owner::SignError;
use starknet::accounts::{Account, AccountError, Call, ExecutionEncoding};
use starknet::core::types::InvokeTransactionResult;
use starknet::macros::selector;
use starknet::providers::jsonrpc::HttpTransport;
use starknet::providers::JsonRpcClient;
use starknet_crypto::Felt;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::Mutex;
use url::Url;

use crate::account::outside_execution::OutsideExecutionRaw;

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
        let (parts, body) = req.into_parts();
        let body_bytes = hyper::body::to_bytes(body).await?;
        let body: Value = serde_json::from_slice(&body_bytes).unwrap_or(json!({}));

        if let Some(method) = body.get("method") {
            if method == "cartridge_addExecuteFromOutsideTranscation" {
                let outside_execution: OutsideExecutionRaw =
                    match parse_param(&body, 0, "Invalid params: Invalid outside execution data") {
                        Ok(value) => value,
                        Err(response) => return Ok(response),
                    };
                let signature: Vec<Felt> =
                    match parse_param(&body, 1, "Invalid params: Invalid signature data") {
                        Ok(value) => value,
                        Err(response) => return Ok(response),
                    };
                let contract_address: Felt =
                    match parse_param(&body, 2, "Invalid params: Invalid contract address") {
                        Ok(value) => value,
                        Err(response) => return Ok(response),
                    };

                match self
                    .execute_from_outside(outside_execution, signature, contract_address)
                    .await
                {
                    Ok(result) => {
                        return Ok(Response::builder()
                            .status(StatusCode::OK)
                            .body(Body::from(
                                json!({
                                    "jsonrpc": "2.0",
                                    "id": body["id"],
                                    "result": format!("0x{:x}", result.transaction_hash)
                                })
                                .to_string(),
                            ))
                            .unwrap());
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

                        return Ok(Response::builder()
                            .status(StatusCode::OK)
                            .header("Content-Type", "application/json")
                            .body(Body::from(error_response.to_string()))
                            .unwrap());
                    }
                };
            }
        }

        let mut proxy_req = Request::builder()
            .method(parts.method)
            .uri(&self.rpc_url.to_string())
            .body(Body::from(serde_json::to_vec(&body).unwrap()))
            .unwrap();

        *proxy_req.headers_mut() = parts.headers;

        self.client.request(proxy_req).await
    }

    async fn execute_from_outside(
        &self,
        outside_execution: OutsideExecutionRaw,
        signature: Vec<Felt>,
        contract_address: Felt,
    ) -> Result<
        InvokeTransactionResult,
        AccountError<SignError<starknet::signers::local_wallet::SignError>>,
    > {
        let mut calldata = <OutsideExecutionRaw as CairoSerde>::cairo_serialize(&outside_execution);
        calldata.extend(<Vec<Felt> as CairoSerde>::cairo_serialize(&signature));

        let call = Call {
            to: contract_address,
            selector: selector!("execute_from_outside_v2"),
            calldata,
        };

        let executor = single_owner_account_with_encoding(
            &self.rpc_client,
            PREFUNDED.0.clone(),
            PREFUNDED.1,
            self.chain_id,
            ExecutionEncoding::New,
        );

        executor.execute_v1(vec![call]).send().await
    }
}

fn parse_param<T: serde::de::DeserializeOwned>(
    body: &Value,
    index: usize,
    error_message: &str,
) -> Result<T, Response<Body>> {
    match serde_json::from_value(body["params"][index].clone()) {
        Ok(value) => Ok(value),
        Err(_) => {
            let error_response = json!({
                "jsonrpc": "2.0",
                "id": body["id"],
                "error": {
                    "code": -32602,
                    "message": error_message
                }
            });
            Err(Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", "application/json")
                .body(Body::from(error_response.to_string()))
                .unwrap())
        }
    }
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use crate::tests::runners::katana::KatanaRunner;

//     #[tokio::test]
//     async fn test_proxy_runner() {
//         let katana = KatanaRunner::load();
//         let proxy_url: Url = "127.0.0.1:8545".parse().unwrap();
//         let proxy = CartridgeProxy::new(katana., proxy_url);

//         tokio::spawn(async move {
//             proxy.run().await;
//         });

//         // Allow some time for the proxy to start
//         tokio::time::sleep(std::time::Duration::from_secs(1)).await;

//         // Test the proxy here
//         // You can use a JSON-RPC client to send requests to the proxy
//         // and verify that it correctly handles the custom method and proxies other requests
//     }
// }
