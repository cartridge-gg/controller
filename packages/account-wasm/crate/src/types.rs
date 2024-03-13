use serde::{Deserialize, Serialize};
use starknet::{
    accounts::Call,
    core::types::{FieldElement, FromStrError},
};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

// pub struct CallWrapper(pub JsCall);

// #[wasm_bindgen]
// extern "C" {
//   #[wasm_bindgen(typescript_type = "Call")]
//   pub type JsCall;

//   #[wasm_bindgen]
//   fn contractAddress(this: &JsCall) -> String;

//   #[wasm_bindgen]
//   fn calldata(this: &JsCall) -> Vec<String>;

//   #[wasm_bindgen]
//   fn entrypoint(this: &JsCall) -> String;
// }

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
    pub entrypoint: FieldElement,
    pub calldata: Vec<FieldElement>,
}

impl TryFrom<JsCall> for Call {
    type Error = FromStrError;

    fn try_from(value: JsCall) -> Result<Self, Self::Error> {
        let contract_address = FieldElement::from_str(&value.contract_address.to_string())?;
        let entrypoint = FieldElement::from_str(&value.entrypoint.to_string())?;
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
