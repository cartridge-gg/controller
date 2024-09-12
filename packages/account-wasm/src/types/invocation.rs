use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::Felt;
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

#[serde_as]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct JsInvocationsDetails {
    #[serde_as(as = "UfeHex")]
    pub max_fee: Felt,
}
