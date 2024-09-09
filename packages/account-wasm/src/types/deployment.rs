use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::Felt;

use super::call::JsCall;

#[serde_as]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsDeployment {
    #[serde_as(as = "UfeHex")]
    pub address: Felt,
    pub calls: Vec<JsCall>,
    pub session_key: Felt,
}
