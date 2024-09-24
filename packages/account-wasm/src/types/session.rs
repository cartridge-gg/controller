use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::Felt;
use tsify_next::Tsify;
use wasm_bindgen::JsValue;

use super::policy::Policy;
use super::EncodingError;

#[serde_as]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct Credentials {
    #[serde_as(as = "Vec<UfeHex>")]
    pub authorization: Vec<Felt>,
    #[serde_as(as = "UfeHex")]
    pub private_key: Felt,
}

impl TryFrom<JsValue> for Credentials {
    type Error = EncodingError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl From<account_sdk::storage::Credentials> for Credentials {
    fn from(value: account_sdk::storage::Credentials) -> Self {
        Self {
            authorization: value.authorization,
            private_key: value.private_key,
        }
    }
}

#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub policies: Vec<Policy>,
    pub expires_at: u64,
}

impl TryFrom<JsValue> for Session {
    type Error = EncodingError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl From<account_sdk::account::session::hash::Session> for Session {
    fn from(value: account_sdk::account::session::hash::Session) -> Self {
        Session {
            policies: value
                .policies
                .into_iter()
                .map(|p| p.policy.into())
                .collect::<Vec<_>>(),
            expires_at: value.expires_at,
        }
    }
}

#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct SessionMetadata {
    pub session: Session,
    pub max_fee: Option<Felt>,
    pub credentials: Credentials,
    pub is_registered: bool,
}

impl TryFrom<JsValue> for SessionMetadata {
    type Error = EncodingError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl From<account_sdk::storage::SessionMetadata> for SessionMetadata {
    fn from(value: account_sdk::storage::SessionMetadata) -> Self {
        SessionMetadata {
            session: value.session.into(),
            max_fee: value.max_fee,
            credentials: value.credentials.into(),
            is_registered: value.is_registered,
        }
    }
}
