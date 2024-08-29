use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::Felt;
use tsify_next::Tsify;

use super::policy::JsPolicy;

#[serde_as]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct JsCredentials {
    #[serde_as(as = "Vec<UfeHex>")]
    pub authorization: Vec<Felt>,
    #[serde_as(as = "UfeHex")]
    pub private_key: Felt,
}

#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct JsSession {
    pub policies: Vec<JsPolicy>,
    pub expires_at: u64,
}
