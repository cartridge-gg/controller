use account_sdk::account::session::hash::AllowedMethod;
use serde::{Deserialize, Serialize};
use starknet::{
    accounts::Call,
    core::{
        types::{FieldElement, FromStrError},
        utils::get_selector_from_name,
    },
};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsInvocationsDetails {
    pub nonce: FieldElement,
    pub max_fee: FieldElement,
    pub version: Option<FieldElement>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsCall {
    pub contract_address: FieldElement,
    pub entrypoint: String,
    pub calldata: Vec<FieldElement>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsCredentials {
    pub authorization: Vec<FieldElement>,
    pub private_key: FieldElement,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsPolicy {
    pub target: String,
    pub method: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsSession {
    pub policies: Vec<JsPolicy>,
    pub expires_at: String,
    pub credentials: JsCredentials,
}

impl TryFrom<JsPolicy> for AllowedMethod {
    type Error = FromStrError;

    fn try_from(value: JsPolicy) -> Result<Self, Self::Error> {
        Ok(AllowedMethod {
            contract_address: FieldElement::from_str(&value.target)?,
            selector: get_selector_from_name(&value.method).unwrap(),
        })
    }
}

impl TryFrom<JsValue> for JsPolicy {
    type Error = JsError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
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
    type Error = JsError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}

impl TryFrom<JsValue> for JsInvocationsDetails {
    type Error = JsError;

    fn try_from(value: JsValue) -> Result<Self, Self::Error> {
        Ok(serde_wasm_bindgen::from_value(value)?)
    }
}
