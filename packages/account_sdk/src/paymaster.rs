use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet_types_core::felt::Felt;
use url::Url;

use crate::abigen::controller::OutsideExecution;

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
pub struct OutsideExecutionParams {
    #[serde_as(as = "UfeHex")]
    pub address: Felt,
    pub outside_execution: OutsideExecution,
    #[serde_as(as = "Vec<UfeHex>")]
    pub signature: Vec<Felt>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PaymasterResponse {
    pub id: u64,
    pub jsonrpc: String,
    #[serde(flatten)]
    pub result: PaymasterResponseResult,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(untagged)]
pub enum PaymasterResponseResult {
    Success(TransactionResult),
    Error(PaymasterErrorResponse),
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PaymasterErrorResponse {
    pub error: PaymasterErrorDetails,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PaymasterErrorDetails {
    pub code: i32,
    pub message: String,
}

#[serde_as]
#[derive(Debug, Deserialize, Serialize)]
pub struct TransactionResult {
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
    #[error("Rpc error: {code} {message}")]
    RpcError { code: i32, message: String },
}

impl PaymasterRequest {
    pub async fn send(
        rpc_url: Url,
        outside_execution: OutsideExecution,
        address: Felt,
        signature: Vec<Felt>,
    ) -> Result<PaymasterResponse, PaymasterError> {
        let request = JsonRpcRequest {
            id: 1,
            jsonrpc: "2.0",
            method: "cartridge_addExecuteOutsideTransaction",
            params: OutsideExecutionParams {
                address,
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

        let response: PaymasterResponse = response.json().await.map_err(PaymasterError::from)?;

        match response.result {
            PaymasterResponseResult::Success(_) => Ok(response),
            PaymasterResponseResult::Error(error_response) => Err(PaymasterError::RpcError {
                code: error_response.error.code,
                message: error_response.error.message,
            }),
        }
    }
}
