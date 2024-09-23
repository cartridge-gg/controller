use account_sdk::abigen::controller::{Call, OutsideExecution};
use account_sdk::account::outside_execution::OutsideExecutionCaller;
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::Felt;
use starknet::macros::short_string;
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use super::EncodingError;

use super::call::JsCall;

#[allow(non_snake_case)]
#[serde_as]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct JsOutsideExecution {
    #[serde_as(as = "UfeHex")]
    pub caller: Felt,
    pub execute_before: u64,
    pub execute_after: u64,
    pub calls: Vec<JsCall>,
    #[serde_as(as = "UfeHex")]
    pub nonce: Felt,
}

impl TryFrom<JsValue> for JsOutsideExecution {
    type Error = EncodingError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl TryFrom<JsOutsideExecution> for OutsideExecution {
    type Error = EncodingError;

    fn try_from(value: JsOutsideExecution) -> Result<Self, Self::Error> {
        let caller = if value.caller.eq(&short_string!("ANY_CALLER")) {
            OutsideExecutionCaller::Any
        } else {
            OutsideExecutionCaller::Specific(value.caller.into())
        };

        Ok(OutsideExecution {
            caller: caller.into(),
            execute_after: value.execute_after,
            execute_before: value.execute_before,
            nonce: value.nonce,
            calls: value
                .calls
                .into_iter()
                .map(Call::try_from)
                .collect::<Result<Vec<Call>, _>>()?,
        })
    }
}
