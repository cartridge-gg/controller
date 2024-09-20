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

        let json_response: Value = response.json().await?;
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

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_json_rpc_error_to_paymaster_error() {
        let json_response = json!({
            "id": 1,
            "jsonrpc": "2.0",
            "error": {
                "code": 41,
                "message": "Transaction execution error",
                "data": {"execution_error":"Transaction reverted: Transaction execution has failed:\n0: Error in the called contract (contract address: 0x057156ef71dcfb930a272923dcbdc54392b6676497fdc143042ee1d4a7a861c1, class hash: 0x00e2eb8f5672af4e6a4e8a8f1b44989685e668489b0a25437733756c5a34a1d6, selector: 0x015d40a3d6ca2ac30f4031e42be28da9b056fef9bb7357ac5e85627ee876e5ad):\nError at pc=0:4302:\nCairo traceback (most recent call last):\nUnknown location (pc=0:290)\nUnknown location (pc=0:3037)\nUnknown location (pc=0:4318)\n\n1: Error in the called contract (contract address: 0x01f067407dd965de6d8ccc49f5774ccf7523e3b0573c4e9531fb997ab1782ec3, class hash: 0x032e17891b6cc89e0c3595a3df7cee760b5993744dc8dfef2bd4d443e65c0f40, selector: 0x034cc13b274446654ca3233ed2c1620d4c5d1d32fd20b47146a3371064bdc57d):\nError at pc=0:17371:\nCairo traceback (most recent call last):\nUnknown location (pc=0:3273)\nUnknown location (pc=0:12736)\n\n2: Error in the called contract (contract address: 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7, class hash: 0x02a8846878b6ad1f54f6ba46f5f40e11cee755c677f130b2c4b60566c9003f1f, selector: 0x0219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c):\nError at pc=0:1354:\nAn ASSERT_EQ instruction failed: 5:3 != 5:0.\n","transaction_index":0}
            }
        });

        let json_rpc_response: JsonRpcResponse<PaymasterResponse> =
            serde_json::from_value(json_response).unwrap();

        match json_rpc_response {
            JsonRpcResponse::Success { .. } => {
                panic!("Expected an error response, got success")
            }
            JsonRpcResponse::Error { error, .. } => {
                let paymaster_error = PaymasterError::from(error);
                match paymaster_error {
                    PaymasterError::ProviderError(ProviderError::StarknetError(StarknetError::TransactionExecutionError(data))) => {
                        assert!(data.execution_error.contains("Transaction reverted: Transaction execution has failed"));
                        assert_eq!(data.transaction_index, 0);
                    },
                    _ => panic!("Expected PaymasterError::ProviderError(ProviderError::StarknetError(StarknetError::TransactionExecutionError))"),
                }
            }
        }
    }
}
