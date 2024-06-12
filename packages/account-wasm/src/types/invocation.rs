use serde::{Deserialize, Serialize};
use starknet::core::types::FieldElement;
use wasm_bindgen::prelude::*;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsInvocationsDetails {
    pub nonce: FieldElement,
    pub max_fee: FieldElement,
    pub version: Option<FieldElement>,
}

impl TryFrom<JsValue> for JsInvocationsDetails {
    type Error = JsError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}
