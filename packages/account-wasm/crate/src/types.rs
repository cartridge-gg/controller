use serde::{Deserialize, Serialize};
use starknet::{
    accounts::Call,
    core::{types::{FieldElement, FromStrError}, utils::get_selector_from_name},
};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsInvocationsDetails {
    pub nonce: FieldElement,
    pub max_fee: FieldElement,
    pub version: FieldElement,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsCall {
    pub contract_address: FieldElement,
    pub entrypoint: String,
    pub calldata: Vec<FieldElement>,
}

impl TryFrom<JsCall> for Call {
    type Error = FromStrError;

    fn try_from(value: JsCall) -> Result<Self, Self::Error> {
        let contract_address = FieldElement::from_str(&value.contract_address.to_string())?;
        let entrypoint = get_selector_from_name(&value.entrypoint).unwrap();
        let calldata = value
            .calldata
            .iter()
            .map(|c| FieldElement::from_str(&c.to_string()))
            .collect::<Result<Vec<FieldElement>, _>>()?;

        Ok(Call {
            to: contract_address,
            selector: entrypoint,
            calldata,
        })
    }
}

impl TryFrom<JsValue> for JsCall {
    type Error = JsValue;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl TryFrom<JsValue> for JsInvocationsDetails {
    type Error = JsValue;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}
