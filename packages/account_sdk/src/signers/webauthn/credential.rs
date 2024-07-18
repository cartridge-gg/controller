use cainome::cairo_serde::U256;
use serde::{Deserialize, Serialize};

use crate::abigen::controller::Signature;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CliendData {
    #[serde(rename = "type")]
    pub(super) type_: String,
    pub(super) challenge: String,
    pub(super) origin: String,
    #[serde(rename = "crossOrigin")]
    pub(super) cross_origin: bool,
}

impl CliendData {
    pub fn new(challenge: impl AsRef<[u8]>, origin: String) -> Self {
        use base64::{engine::general_purpose::URL_SAFE, Engine as _};
        let challenge = URL_SAFE.encode(challenge);

        Self {
            type_: "webauthn.get".into(),
            challenge,
            origin,
            cross_origin: false,
        }
    }
    pub fn to_json(&self) -> String {
        serde_json::to_string(self).unwrap()
    }
}

#[derive(Debug, Clone)]
pub struct AuthenticatorAssertionResponse {
    pub authenticator_data: AuthenticatorData,
    pub client_data_json: String,
    pub signature: Signature,
    pub user_handle: Option<Vec<u8>>,
}

impl AuthenticatorAssertionResponse {
    pub fn client_data(&self) -> CliendData {
        serde_json::from_str(&self.client_data_json).unwrap()
    }
    pub fn nomalise_signature(mut self) -> AuthenticatorAssertionResponse {
        use p256::{
            elliptic_curve::{
                bigint::{Encoding, Uint},
                scalar::FromUintUnchecked,
            },
            Scalar,
        };
        use std::ops::Neg;
        let s = self.signature.s;
        let s_scalar = Scalar::from_uint_unchecked(Uint::from_be_bytes(s.to_bytes_be()));
        let s_neg = U256::from_bytes_be(s_scalar.neg().to_bytes().as_slice().try_into().unwrap());
        if s > s_neg {
            dbg!("aa");
            self.signature.s = s_neg;
            self.signature.y_parity = !self.signature.y_parity;
        }
        self
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct AuthenticatorData {
    pub rp_id_hash: [u8; 32],
    pub flags: u8,
    pub sign_count: u32,
}

impl From<AuthenticatorData> for Vec<u8> {
    fn from(value: AuthenticatorData) -> Self {
        let mut data = Vec::new();
        data.extend_from_slice(&value.rp_id_hash);
        data.push(value.flags);
        data.extend_from_slice(&value.sign_count.to_be_bytes());
        data
    }
}
