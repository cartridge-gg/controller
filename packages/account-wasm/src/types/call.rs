use account_sdk::abigen::controller::Call;
use serde::{Deserialize, Serialize};
use starknet::core::types;
use starknet::core::utils::get_selector_from_name;
use starknet_crypto::Felt;
use tsify_next::Tsify;
use wasm_bindgen::prelude::*;

use super::{EncodingError, JsFelt};

#[allow(non_snake_case)]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
#[serde(rename_all = "camelCase")]
pub struct JsCall {
    pub contract_address: JsFelt,
    pub entrypoint: String,
    pub calldata: Vec<JsFelt>,
}

impl TryFrom<JsCall> for Call {
    type Error = EncodingError;

    fn try_from(value: JsCall) -> Result<Self, Self::Error> {
        let felt: Felt = value.contract_address.try_into()?;
        Ok(Call {
            to: felt.into(),
            selector: get_selector_from_name(&value.entrypoint)?,
            calldata: value
                .calldata
                .into_iter()
                .map(TryInto::try_into)
                .collect::<Result<Vec<_>, _>>()?,
        })
    }
}

impl TryFrom<JsCall> for types::Call {
    type Error = EncodingError;

    fn try_from(value: JsCall) -> Result<Self, Self::Error> {
        Ok(types::Call {
            to: value.contract_address.try_into()?,
            selector: get_selector_from_name(&value.entrypoint)?,
            calldata: value
                .calldata
                .into_iter()
                .map(TryInto::try_into)
                .collect::<Result<Vec<_>, _>>()?,
        })
    }
}
