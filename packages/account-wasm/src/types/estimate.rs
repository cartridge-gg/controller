use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::{serde::unsigned_field_element::UfeHex, types::Felt};
use wasm_bindgen::prelude::*;

#[serde_as]
#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsEstimateFeeDetails {
    #[serde_as(as = "UfeHex")]
    pub nonce: Felt,
}

impl TryFrom<JsValue> for JsEstimateFeeDetails {
    type Error = JsError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}
