use serde::{Deserialize, Serialize};
use starknet::core::{types::Felt, utils::get_selector_from_name};
use std::str::FromStr;
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use account_sdk::account::session::hash::{
    CallPolicy as SdkCallPolicy, Policy as SdkPolicy, TypedDataPolicy as SdkTypedDataPolicy,
};

use super::EncodingError;

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct Policy {
    pub call_policy: Option<CallPolicy>,
    pub typed_data_policy: Option<TypedDataPolicy>,
}

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct CallPolicy {
    pub target: String,
    pub method: String,
}

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct TypedDataPolicy {
    pub type_hash: String,
}

impl TryFrom<JsValue> for Policy {
    type Error = EncodingError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl TryFrom<Policy> for SdkPolicy {
    type Error = EncodingError;

    fn try_from(value: Policy) -> Result<Self, Self::Error> {
        if value.call_policy.is_some() && value.typed_data_policy.is_some() {
            return Err(EncodingError::UnexpectedOption("Policy: Both call_policy and typed_data_policy are Some when exactly one is expected".to_string()));
        }
        if let Some(call_policy) = value.call_policy {
            return Ok(SdkPolicy::Call(SdkCallPolicy {
                contract_address: Felt::from_str(&call_policy.target)?,
                selector: get_selector_from_name(&call_policy.method).unwrap(),
            }));
        }
        if let Some(typed_data_policy) = value.typed_data_policy {
            return Ok(SdkPolicy::TypedData(SdkTypedDataPolicy {
                type_hash: Felt::from_str(&typed_data_policy.type_hash)?,
            }));
        }
        Err(EncodingError::UnexpectedOption("Policy: Neither call_policy nor typed_data_policy is Some when exactly one is expected".to_string()))
    }
}

impl From<SdkPolicy> for Policy {
    fn from(value: SdkPolicy) -> Self {
        match value {
            SdkPolicy::Call(call_policy) => Self {
                call_policy: Some(CallPolicy {
                    target: call_policy.contract_address.to_string(),
                    method: call_policy.selector.to_string(),
                }),
                typed_data_policy: None,
            },
            SdkPolicy::TypedData(typed_data_policy) => Self {
                call_policy: None,
                typed_data_policy: Some(TypedDataPolicy {
                    type_hash: typed_data_policy.type_hash.to_string(),
                }),
            },
        }
    }
}
