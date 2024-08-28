use account_sdk::account::session::hash::Session;
use account_sdk::signers::HashSigner;
use serde::{Deserialize, Serialize};
use serde_with::serde_as;
use starknet::core::serde::unsigned_field_element::UfeHex;
use starknet::core::types::Felt;
use starknet::signers::SigningKey;
use tsify_next::Tsify;

use crate::errors::{CartridgeError, EncodingError, OperationError};

use super::policy::JsPolicy;
use super::TryFromJsValue;

#[serde_as]
#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct JsCredentials {
    #[serde_as(as = "Vec<UfeHex>")]
    pub authorization: Vec<Felt>,
    #[serde_as(as = "UfeHex")]
    pub private_key: Felt,
}

#[derive(Tsify, Serialize, Deserialize, Debug, Clone)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct JsSession {
    pub policies: Vec<JsPolicy>,
    pub expires_at: u64,
    pub credentials: JsCredentials,
}

impl TryFrom<JsSession> for Session {
    type Error = CartridgeError;
    
    fn try_from(value: JsSession) -> Result<Self, Self::Error> {
        let policies = value
            .policies
            .into_iter()
            .map(|policy| policy.try_into())
            .collect::<Result<Vec<_>, _>>()?;

        let signer = SigningKey::from_secret_scalar(value.credentials.private_key).signer();
        Ok(Session::new(policies, value.expires_at, &signer).map_err(OperationError::SignMessage)?)
    }
}
