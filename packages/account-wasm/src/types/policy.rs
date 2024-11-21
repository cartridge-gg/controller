use serde::{Deserialize, Serialize};
use starknet::core::{types::Felt, utils::get_selector_from_name};
use std::str::FromStr;
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use account_sdk::account::session::policy::{
    CallPolicy as SdkCallPolicy, Policy as SdkPolicy, TypedDataPolicy as SdkTypedDataPolicy,
};

use super::EncodingError;

#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct CallPolicy {
    pub target: String,
    pub method: String,
}

#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct TypedDataPolicy {
    pub scope_hash: String,
}

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(untagged)]
pub enum Policy {
    Call(CallPolicy),
    TypedData(TypedDataPolicy),
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
        match value {
            Policy::Call(CallPolicy { target, method }) => Ok(SdkPolicy::Call(SdkCallPolicy {
                contract_address: Felt::from_str(&target)?,
                selector: get_selector_from_name(&method).unwrap(),
            })),
            Policy::TypedData(TypedDataPolicy { scope_hash }) => {
                Ok(SdkPolicy::TypedData(SdkTypedDataPolicy {
                    scope_hash: Felt::from_str(&scope_hash)?,
                }))
            }
        }
    }
}

impl From<SdkPolicy> for Policy {
    fn from(value: SdkPolicy) -> Self {
        match value {
            SdkPolicy::Call(call_policy) => Policy::Call(CallPolicy {
                target: call_policy.contract_address.to_string(),
                method: call_policy.selector.to_string(),
            }),
            SdkPolicy::TypedData(typed_data_policy) => Policy::TypedData(TypedDataPolicy {
                scope_hash: typed_data_policy.scope_hash.to_string(),
            }),
        }
    }
}
