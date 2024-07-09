use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::Felt;

use super::policy::JsPolicy;

#[serde_as]
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsCredentials {
    #[serde_as(as = "Vec<UfeHex>")]
    pub authorization: Vec<Felt>,
    #[serde_as(as = "UfeHex")]
    pub private_key: Felt,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JsSession {
    pub policies: Vec<JsPolicy>,
    pub expires_at: String,
    pub credentials: JsCredentials,
}
