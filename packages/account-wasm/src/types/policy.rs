use account_sdk::account::session::hash::AllowedMethod;
use serde::{Deserialize, Serialize};
use starknet::core::{types::Felt, utils::get_selector_from_name};
use std::str::FromStr;
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use super::EncodingError;

#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct JsPolicy {
    pub target: String,
    pub method: String,
}

impl TryFrom<JsValue> for JsPolicy {
    type Error = EncodingError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl TryFrom<JsPolicy> for AllowedMethod {
    type Error = EncodingError;

    fn try_from(value: JsPolicy) -> Result<Self, Self::Error> {
        Ok(AllowedMethod {
            contract_address: Felt::from_str(&value.target)?,
            selector: get_selector_from_name(&value.method).unwrap(),
        })
    }
}
