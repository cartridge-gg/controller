use serde::{Deserialize, Serialize};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use account_sdk::account::session::policy::{
    CallPolicy as SdkCallPolicy, Policy as SdkPolicy, TypedDataPolicy as SdkTypedDataPolicy,
};

use super::{EncodingError, JsFelt};
use account_sdk::typed_data::{encode_type, TypedData};
use starknet::core::types::Call;
use starknet::core::utils::starknet_keccak;
use starknet_crypto::poseidon_hash;

#[derive(Tsify, Serialize, Deserialize, Debug, Clone, PartialEq)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct CallPolicy {
    pub target: JsFelt,
    pub method: JsFelt,
    #[tsify(optional)]
    pub authorized: Option<bool>,
}

#[derive(Tsify, Serialize, Deserialize, Debug, Clone, PartialEq)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct TypedDataPolicy {
    pub scope_hash: JsFelt,
    #[tsify(optional)]
    pub authorized: Option<bool>,
}

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone, PartialEq)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(untagged)]
pub enum Policy {
    Call(CallPolicy),
    TypedData(TypedDataPolicy),
}

impl Policy {
    pub fn is_requested(&self, policy: &Policy) -> bool {
        match (self, policy) {
            (Policy::Call(self_call), Policy::Call(policy_call)) => {
                self_call.target == policy_call.target && self_call.method == policy_call.method
            }
            (Policy::TypedData(self_td), Policy::TypedData(policy_td)) => {
                self_td.scope_hash == policy_td.scope_hash
            }
            _ => false,
        }
    }

    pub fn is_authorized(&self, policy: &Policy) -> bool {
        match (self, policy) {
            (Policy::Call(self_call), Policy::Call(policy_call)) => {
                self_call.target == policy_call.target
                    && self_call.method == policy_call.method
                    && self_call.authorized.unwrap_or(false)
            }
            (Policy::TypedData(self_td), Policy::TypedData(policy_td)) => {
                self_td.scope_hash == policy_td.scope_hash && self_td.authorized.unwrap_or(false)
            }
            _ => false,
        }
    }
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
            Policy::Call(CallPolicy {
                target,
                method,
                authorized,
            }) => Ok(SdkPolicy::Call(SdkCallPolicy {
                contract_address: target.try_into()?,
                selector: method.try_into()?,
                authorized,
            })),
            Policy::TypedData(TypedDataPolicy {
                scope_hash,
                authorized,
            }) => Ok(SdkPolicy::TypedData(SdkTypedDataPolicy {
                scope_hash: scope_hash.try_into()?,
                authorized,
            })),
        }
    }
}

impl From<SdkPolicy> for Policy {
    fn from(value: SdkPolicy) -> Self {
        match value {
            SdkPolicy::Call(call_policy) => Policy::Call(CallPolicy {
                target: call_policy.contract_address.into(),
                method: call_policy.selector.into(),
                authorized: call_policy.authorized,
            }),
            SdkPolicy::TypedData(typed_data_policy) => Policy::TypedData(TypedDataPolicy {
                scope_hash: typed_data_policy.scope_hash.into(),
                authorized: typed_data_policy.authorized,
            }),
        }
    }
}

impl Policy {
    pub fn from_call(call: &Call) -> Self {
        Self::Call(CallPolicy {
            target: call.to.into(),
            method: call.selector.into(),
            authorized: Some(true),
        })
    }

    pub fn from_typed_data(typed_data: &TypedData) -> Result<Self, JsError> {
        let domain_hash = typed_data.domain.encode(&typed_data.types)?;
        let type_hash =
            &starknet_keccak(encode_type(&typed_data.primary_type, &typed_data.types)?.as_bytes());
        let scope_hash = poseidon_hash(domain_hash, *type_hash);

        Ok(Self::TypedData(TypedDataPolicy {
            scope_hash: scope_hash.into(),
            authorized: Some(true),
        }))
    }
}
