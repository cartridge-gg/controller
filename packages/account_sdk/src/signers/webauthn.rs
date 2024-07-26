use super::{HashSigner, SignError};
use crate::abigen::controller::{
    Sha256Implementation, Signer, SignerSignature, WebauthnSignature, WebauthnSigner,
};

use async_trait::async_trait;
use cainome::cairo_serde::U256;
use starknet::core::types::Felt;

pub type Secp256r1Point = (U256, U256);

use serde::{Deserialize, Serialize};

use crate::abigen::controller::Signature;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientData {
    #[serde(rename = "type")]
    pub(super) type_: String,
    pub(super) challenge: String,
    pub(super) origin: String,
    #[serde(rename = "crossOrigin")]
    pub(super) cross_origin: bool,
}

impl ClientData {
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
    pub fn client_data(&self) -> ClientData {
        serde_json::from_str(&self.client_data_json).unwrap()
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

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait WebauthnAccountSigner {
    async fn sign(&self, challenge: &[u8]) -> Result<AuthenticatorAssertionResponse, SignError>;
    fn signer_pub_data(&self) -> WebauthnSigner;
    fn sha256_version(&self) -> Sha256Implementation {
        Sha256Implementation::Cairo1
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> HashSigner for T
where
    T: WebauthnAccountSigner + Sync,
{
    // According to https://www.w3.org/TR/webauthn/#clientdatajson-verification
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        let mut challenge = tx_hash.to_bytes_be().to_vec();

        challenge.push(self.sha256_version().encode());
        let mut assertion: AuthenticatorAssertionResponse = self.sign(&challenge).await?;
        use p256::{
            elliptic_curve::{
                bigint::{Encoding, Uint},
                scalar::FromUintUnchecked,
            },
            Scalar,
        };
        use std::ops::Neg;
        let s = assertion.signature.s;
        let s_scalar = Scalar::from_uint_unchecked(Uint::from_be_bytes(s.to_bytes_be()));
        let s_neg = U256::from_bytes_be(s_scalar.neg().to_bytes().as_slice().try_into().unwrap());
        if s > s_neg {
            assertion.signature.s = s_neg;
            assertion.signature.y_parity = !assertion.signature.y_parity;
        }

        let webauthn_signature = WebauthnSignature {
            flags: assertion.authenticator_data.flags,
            cross_origin: assertion.client_data().cross_origin,
            sign_count: assertion.authenticator_data.sign_count,
            ec_signature: assertion.signature,
            sha256_implementation: self.sha256_version(),
            client_data_json_outro: vec![], //TODO: it can theoretically be non-empty
        };

        Ok(SignerSignature::Webauthn((
            self.signer_pub_data(),
            webauthn_signature,
        )))
    }

    fn signer(&self) -> Signer {
        Signer::Webauthn(self.signer_pub_data())
    }
}

trait Sha256ImplementationEncoder {
    fn encode(&self) -> u8;
}

impl Sha256ImplementationEncoder for Sha256Implementation {
    fn encode(&self) -> u8 {
        match self {
            Sha256Implementation::Cairo0 => 0,
            Sha256Implementation::Cairo1 => 1,
        }
    }
}

pub fn find_value_index_length(json_str: &str, key: &str) -> Option<(usize, usize)> {
    let key_index = json_str.find(&format!("\"{}\"", key))?;

    let colon_index = json_str[key_index..].find(':')? + key_index;

    let value_start_index = json_str[colon_index + 1..].find('"')?;

    let value_length = json_str[colon_index + 1 + value_start_index + 1..]
        .find('"')
        .unwrap();

    Some((colon_index + 1 + value_start_index + 1, value_length))
}

#[cfg(test)]
mod tests {
    use super::find_value_index_length;
    #[test]
    fn test_find_value_index() {
        let json_str =
            r#"{"type":"webauthn.get","challenge":"aGVsbG8=","origin":"https://example.com"}"#;
        assert_eq!(find_value_index_length(json_str, "type"), Some((9, 12)));
        assert_eq!(
            find_value_index_length(json_str, "challenge"),
            Some((36, 8))
        );
        assert_eq!(find_value_index_length(json_str, "origin"), Some((56, 19)));
    }

    #[test]
    fn test_find_value_index_whitespace() {
        let json_str = r#"{   "type":      "webauthn.get",  "challenge":   "aGVsbG8=","origin":    "https://example.com"}"#;
        assert_eq!(find_value_index_length(json_str, "type"), Some((18, 12)));
        assert_eq!(
            find_value_index_length(json_str, "challenge"),
            Some((50, 8))
        );
        assert_eq!(find_value_index_length(json_str, "origin"), Some((74, 19)));
    }
}
