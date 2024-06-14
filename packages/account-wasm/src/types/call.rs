use serde::{Deserialize, Serialize};
use starknet::{
    accounts::Call,
    core::{types::FieldElement, utils::get_selector_from_name},
};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

use super::TryFromJsValue;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsCall {
    pub contract_address: FieldElement,
    pub entrypoint: String,
    pub calldata: Vec<FieldElement>,
}

impl TryFrom<JsCall> for Call {
    type Error = JsError;

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
    type Error = JsError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl From<Call> for JsCall {
    fn from(value: Call) -> Self {
        JsCall {
            contract_address: value.to,
            entrypoint: value.selector.to_string(),
            calldata: value.calldata,
        }
    }
}

impl TryFromJsValue<Call> for Call {
    fn try_from_js_value(value: JsValue) -> Result<Self, JsError> {
        let js_call: JsCall = value.try_into()?;
        js_call.try_into()
    }
}
