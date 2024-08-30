use account_sdk::abigen::controller::Call;
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types;
use starknet::core::utils::get_selector_from_name;
use starknet_types_core::felt::Felt;
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use crate::errors::EncodingError;

#[serde_as]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct JsCall {
    #[serde_as(as = "UfeHex")]
    pub contract_address: Felt,
    pub entrypoint: String,
    #[serde_as(as = "Vec<UfeHex>")]
    pub calldata: Vec<Felt>,
}

impl TryFrom<JsCall> for Call {
    type Error = EncodingError;

    fn try_from(value: JsCall) -> Result<Self, Self::Error> {
        Ok(Call {
            to: value.contract_address.into(),
            selector: get_selector_from_name(&value.entrypoint)?,
            calldata: value.calldata,
        })
    }
}

impl TryFrom<JsCall> for types::Call {
    type Error = EncodingError;

    fn try_from(value: JsCall) -> Result<Self, Self::Error> {
        Ok(types::Call {
            to: value.contract_address,
            selector: get_selector_from_name(&value.entrypoint)?,
            calldata: value.calldata,
        })
    }
}
