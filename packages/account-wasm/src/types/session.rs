use serde::{Deserialize, Serialize};
use starknet::core::types::FieldElement;

use super::policy::JsPolicy;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsCredentials {
    pub authorization: Vec<FieldElement>,
    pub private_key: FieldElement,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsSession {
    pub policies: Vec<JsPolicy>,
    pub expires_at: String,
    pub credentials: JsCredentials,
}
