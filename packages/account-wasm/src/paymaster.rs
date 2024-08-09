use convert_case::{Case, Casing};
use gloo_net::http::Request;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::Felt;
use url::Url;
use wasm_bindgen::JsError;

use crate::{types::outside_execution::JsOutsideExecution, Result};

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
pub struct JsonRpcResponse {
    jsonrpc: String,
    id: u64,
    result: PaymasterResponse,
}

#[serde_as]
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct OutsideExecutionParams {
    #[serde_as(as = "UfeHex")]
    address: Felt,
    #[serde_as(as = "UfeHex")]
    chain_id: Felt,
    outside_execution: JsOutsideExecution,
    #[serde_as(as = "Vec<UfeHex>")]
    signature: Vec<Felt>,
}

#[serde_as]
#[derive(Debug, Deserialize, Serialize)]
pub struct PaymasterResponse {
    #[serde_as(as = "UfeHex")]
    transaction_hash: Felt,
}

impl PaymasterRequest {
    pub async fn send(
        rpc_url: Url,
        outside_execution: JsOutsideExecution,
        address: Felt,
        chain_id: Felt,
        signature: Vec<Felt>,
    ) -> Result<JsonRpcResponse> {
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

        let body = serde_json::to_value(&request).map(convert_to_snake_case)?;

        let response = Request::post(rpc_url.as_str())
            .header("Content-Type", "application/json")
            .body(body.to_string())?
            .send()
            .await?;

        if !response.ok() {
            return Err(JsError::new(&response.status_text()));
        }

        Ok(response.json().await?)
    }
}

pub(crate) fn convert_to_snake_case(value: Value) -> Value {
    match value {
        Value::Object(map) => {
            let mut new_map = Map::new();
            for (k, v) in map {
                let new_key = k.to_case(Case::Snake);
                new_map.insert(new_key, convert_to_snake_case(v));
            }
            Value::Object(new_map)
        }
        Value::Array(arr) => Value::Array(arr.into_iter().map(convert_to_snake_case).collect()),
        v => v,
    }
}
