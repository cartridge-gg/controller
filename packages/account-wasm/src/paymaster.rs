use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::to_value;
use starknet::core::types::FieldElement;
use url::Url;
use wasm_bindgen::JsError;
use web_sys::js_sys::JSON::stringify;

use crate::{types::outside_execution::JsOutsideExecution, Result};

pub struct PaymasterRequest {}

#[derive(Debug, Deserialize, Serialize)]
struct JsonRpcRequest<T> {
    id: u64,
    jsonrpc: &'static str,
    method: &'static str,
    params: T,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct OutsideExecutionParams {
    address: FieldElement,
    chain_id: FieldElement,
    outside_execution: JsOutsideExecution,
    signature: Vec<FieldElement>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PaymasterResponse {
    transaction_hash: FieldElement,
}

impl PaymasterRequest {
    pub async fn send(
        rpc_url: Url,
        outside_execution: JsOutsideExecution,
        address: FieldElement,
        chain_id: FieldElement,
        signature: Vec<FieldElement>,
    ) -> Result<PaymasterResponse> {
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

        let body = stringify(&to_value(&request)?)
            .map_err(|_| JsError::new("Error stringifying payload"))?;

        let response = Client::new()
            .post(rpc_url)
            .header("Content-Type", "application/json")
            .body(format!("{}", body))
            .send()
            .await?
            .error_for_status()?;

        Ok(serde_json::from_str(&response.text().await?)?)
    }
}
