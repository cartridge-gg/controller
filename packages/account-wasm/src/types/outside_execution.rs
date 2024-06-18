use account_sdk::account::outside_execution::{OutsideExecution, OutsideExecutionCaller};
use serde::{Deserialize, Serialize};
use starknet::{accounts::Call, core::types::FieldElement, macros::short_string};
use wasm_bindgen::prelude::*;

use super::call::JsCall;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsOutsideExecution {
    pub caller: FieldElement,
    pub execute_before: u64,
    pub execute_after: u64,
    pub calls: Vec<JsCall>,
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
        Ok(OutsideExecution {
            caller: OutsideExecutionCaller::Any,
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

impl From<OutsideExecution> for JsOutsideExecution {
    fn from(value: OutsideExecution) -> Self {
        JsOutsideExecution {
            caller: short_string!("ANY_CALLER"),
            execute_before: value.execute_before,
            execute_after: value.execute_after,
            calls: value.calls.into_iter().map(JsCall::from).collect(),
            nonce: value.nonce,
        }
    }
}
