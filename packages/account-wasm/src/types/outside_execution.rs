use account_sdk::account::outside_execution::{OutsideExecution, OutsideExecutionCaller};
use serde::{Deserialize, Serialize};
use starknet::{
  accounts::Call,
  core::types::FieldElement
  ,
};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

use super::call::JsCall;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsOutsideExecution {
    pub caller: String,
    pub nonce: FieldElement,
    pub execute_before: String,
    pub execute_after: String,
    pub calls: Vec<JsCall>,
}

impl TryFrom<JsValue> for JsOutsideExecution {
  type Error = JsError;

  fn try_from(value: JsValue) -> Result<Self, Self::Error> {
      Ok(serde_wasm_bindgen::from_value(value)?)
  }
}

impl TryFrom<JsOutsideExecution> for OutsideExecution {
  type Error = JsError;

  fn try_from(value: JsOutsideExecution) -> Result<Self, Self::Error> {
      let caller = FieldElement::from_str(&value.caller.to_string())?;
      Ok(OutsideExecution {
          caller: OutsideExecutionCaller::Specific(caller.into()),
          execute_after: value.execute_after.parse()?,
          execute_before: value.execute_before.parse()?,
          nonce: value.nonce,
          calls: value
              .calls
              .into_iter()
              .map(|c| Call::try_from(c))
              .collect::<Result<Vec<Call>, _>>()?,
      })
  }
}
