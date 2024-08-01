use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::Felt;
use url::Url;

use crate::account::outside_execution::OutsideExecution;

pub struct PaymasterRequest {}

#[derive(Debug, Deserialize, Serialize)]
pub(crate) struct JsonRpcRequest<T> {
    id: u64,
    jsonrpc: &'static str,
    method: &'static str,
    params: T,
}

#[serde_as]
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
struct OutsideExecutionParams {
    #[serde_as(as = "UfeHex")]
    address: Felt,
    #[serde_as(as = "UfeHex")]
    chain_id: Felt,
    outside_execution: OutsideExecution,
    #[serde_as(as = "Vec<UfeHex>")]
    signature: Vec<Felt>,
}

#[serde_as]
#[derive(Debug, Deserialize, Serialize)]
pub struct PaymasterResponse {
    #[serde_as(as = "UfeHex")]
    pub transaction_hash: Felt,
}

#[derive(Debug, thiserror::Error)]
pub enum PaymasterError {
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    #[error("Unexpected response: {0}")]
    UnexpectedResponse(String),
}

impl PaymasterRequest {
    pub async fn send(
        rpc_url: Url,
        outside_execution: OutsideExecution,
        address: Felt,
        chain_id: Felt,
        signature: Vec<Felt>,
    ) -> Result<PaymasterResponse, PaymasterError> {
        let request = JsonRpcRequest {
            id: 1,
            jsonrpc: "2.0",
            method: "cartridge_addExecuteOutsideTransaction",
            params: OutsideExecutionParams {
                address,
                chain_id,
                outside_execution,
                signature,
            },
        };

        let client = Client::new();
        let response = client
            .post(rpc_url.as_str())
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(PaymasterError::UnexpectedResponse(format!(
                "HTTP error: {}",
                response.status()
            )));
        }

        response.json().await.map_err(PaymasterError::from)
    }
}
