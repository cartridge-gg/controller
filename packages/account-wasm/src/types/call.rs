use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::{
    accounts::Call,
    core::{types::Felt, utils::get_selector_from_name},
};
use wasm_bindgen::prelude::*;

use crate::errors::EncodingError;

use super::TryFromJsValue;

#[serde_as]
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsCall {
    #[serde_as(as = "UfeHex")]
    pub contract_address: Felt,
    pub entrypoint: String,
    #[serde_as(as = "Vec<UfeHex>")]
    pub calldata: Vec<Felt>,
}

impl TryFrom<JsCall> for Call {
    type Error = EncodingError;

    fn try_from(value: JsCall) -> Result<Self, Self::Error> {
        Ok(Call {
            to: value.contract_address,
            selector: get_selector_from_name(&value.entrypoint)?,
            calldata: value.calldata,
        })
    }
}

impl TryFrom<JsValue> for JsCall {
    type Error = EncodingError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl TryFromJsValue<Call> for Call {
    fn try_from_js_value(value: JsValue) -> Result<Self, EncodingError> {
        let js_call: JsCall = value.try_into()?;
        js_call.try_into()
    }
}
