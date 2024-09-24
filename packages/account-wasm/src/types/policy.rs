use serde::{Deserialize, Serialize};
use starknet::core::{types::Felt, utils::get_selector_from_name};
use std::str::FromStr;
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use super::EncodingError;

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct Policy {
    pub target: String,
    pub method: String,
}

impl TryFrom<JsValue> for Policy {
    type Error = EncodingError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl TryFrom<Policy> for account_sdk::account::session::hash::Policy {
    type Error = EncodingError;

    fn try_from(value: Policy) -> Result<Self, Self::Error> {
        Ok(Self {
            contract_address: Felt::from_str(&value.target)?,
            selector: get_selector_from_name(&value.method).unwrap(),
        })
    }
}

impl From<account_sdk::account::session::hash::Policy> for Policy {
    fn from(value: account_sdk::account::session::hash::Policy) -> Self {
        Self {
            target: value.contract_address.to_string(),
            method: value.selector.to_string(),
        }
    }
}
