use account_sdk::account::session::hash::AllowedMethod;
use serde::{Deserialize, Serialize};
use starknet::core::{
    types::{FieldElement, FromStrError},
    utils::get_selector_from_name,
};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

use super::TryFromJsValue;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsPolicy {
    pub target: String,
    pub method: String,
}

impl TryFrom<JsValue> for JsPolicy {
    type Error = JsError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl TryFrom<JsPolicy> for AllowedMethod {
    type Error = FromStrError;

    fn try_from(value: JsPolicy) -> Result<Self, Self::Error> {
        Ok(AllowedMethod {
            contract_address: FieldElement::from_str(&value.target)?,
            selector: get_selector_from_name(&value.method).unwrap(),
        })
    }
}

impl TryFromJsValue<AllowedMethod> for AllowedMethod {
    fn try_from_js_value(value: JsValue) -> Result<Self, JsError> {
        let js_policy: JsPolicy = value.try_into()?;
        let allowed_method: AllowedMethod = js_policy.try_into()?;
        Ok(allowed_method)
    }
}
