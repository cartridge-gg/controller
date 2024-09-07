use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use serde_with::serde_as;
use starknet::{
    core::{serde::unsigned_field_element::UfeHex, types::StarknetError},
    providers::{
        jsonrpc::{JsonRpcClientError, JsonRpcError, JsonRpcResponse},
        ProviderError,
    },
};
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

#[serde_as]
#[derive(Debug, Deserialize, Serialize)]
pub struct PaymasterResponse {
    #[serde_as(as = "UfeHex")]
    pub transaction_hash: Felt,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PaymasterRPCError {
    pub code: u32,
    pub message: String,
}

impl std::fmt::Display for PaymasterRPCError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Code: {}, Message: {}", self.code, self.message)
    }
}

#[derive(Debug, thiserror::Error)]
pub enum PaymasterError {
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error(transparent)]
    ProviderError(#[from] ProviderError),
    #[error("Execution time not yet reached")]
    ExecutionTimeNotReached,
    #[error("Execution time has passed")]
    ExecutionTimePassed,
    #[error("Invalid caller for this transaction")]
    InvalidCaller,
    #[error("Rate limit exceeded")]
    RateLimitExceeded,
    #[error("Paymaster not supported")]
    PaymasterNotSupported,
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

        let mut json_response: Value = response.json().await?;

        // Preprocess the error if it exists
        if let Some(error) = json_response.get_mut("error") {
            if let Some(code) = error.get("code") {
                if code == 41 {
                    if let Some(data) = error.get_mut("data") {
                        if let Some(data_str) = data.as_str() {
                            if let Ok(parsed_data) = serde_json::from_str::<Value>(data_str) {
                                *data = parsed_data;
                            }
                        }
                    }
                }
            }
        }

        let json_rpc_response: JsonRpcResponse<PaymasterResponse> =
            serde_json::from_value(json_response)?;

        match json_rpc_response {
            JsonRpcResponse::Success { result, .. } => Ok(result),
            JsonRpcResponse::Error { error, .. } => Err(error.into()),
        }
    }
}

impl From<JsonRpcError> for PaymasterError {
    fn from(error: JsonRpcError) -> Self {
        match error {
            err if err.message.contains("execution time not yet reached") => {
                PaymasterError::ExecutionTimeNotReached
            }
            err if err.message.contains("execution time has passed") => {
                PaymasterError::ExecutionTimePassed
            }
            err if err.message.contains("invalid caller") => PaymasterError::InvalidCaller,
            err if err.code == -32005 => PaymasterError::RateLimitExceeded,
            err if err.code == -32003 => PaymasterError::PaymasterNotSupported,
            _ => match TryInto::<StarknetError>::try_into(&error) {
                Ok(starknet_error) => {
                    PaymasterError::ProviderError(ProviderError::StarknetError(starknet_error))
                }
                Err(_) => PaymasterError::ProviderError(ProviderError::StarknetError(
                    StarknetError::UnexpectedError(error.message),
                )),
            },
        }
    }
}

impl From<reqwest::Error> for PaymasterError {
    fn from(error: reqwest::Error) -> Self {
        PaymasterError::ProviderError(
            JsonRpcClientError::<reqwest::Error>::TransportError(error).into(),
        )
    }
}
