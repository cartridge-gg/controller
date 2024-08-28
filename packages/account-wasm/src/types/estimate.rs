use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::{serde::unsigned_field_element::UfeHex, types::Felt};
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

#[serde_as]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct JsEstimateFeeDetails {
    #[serde_as(as = "UfeHex")]
    pub nonce: Felt,
}
