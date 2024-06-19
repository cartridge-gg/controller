use account_sdk::account::outside_execution::{OutsideExecution, OutsideExecutionCaller};
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::macros::short_string;
use starknet::{accounts::Call, core::types::FieldElement};
use wasm_bindgen::prelude::*;

use super::call::JsCall;

#[serde_as]
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsOutsideExecution {
    #[serde_as(as = "UfeHex")]
    pub caller: FieldElement,
    pub execute_before: u64,
    pub execute_after: u64,
    pub calls: Vec<JsCall>,
    #[serde_as(as = "UfeHex")]
    pub nonce: FieldElement,
}

impl TryFrom<JsValue> for JsOutsideExecution {
    type Error = JsError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl TryFrom<JsOutsideExecution> for OutsideExecution {
    type Error = JsError;

    fn try_from(value: JsOutsideExecution) -> Result<Self, Self::Error> {
        let caller = if value.caller.eq(&short_string!("ANY_CALLER")) {
            OutsideExecutionCaller::Any
        } else {
            OutsideExecutionCaller::Specific(value.caller.into())
        };

        Ok(OutsideExecution {
            caller,
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
