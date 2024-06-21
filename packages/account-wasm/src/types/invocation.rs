use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::FieldElement;
use wasm_bindgen::prelude::*;

#[serde_as]
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsInvocationsDetails {
    #[serde_as(as = "UfeHex")]
    pub nonce: FieldElement,
    #[serde_as(as = "UfeHex")]
    pub max_fee: FieldElement,
}

impl TryFrom<JsValue> for JsInvocationsDetails {
    type Error = JsError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}
