use super::{HashSigner, SignError};
use crate::abigen::controller::{Signer, SignerSignature, WebauthnAssertion, WebauthnSigner};

use async_trait::async_trait;
use cainome::cairo_serde::U256;
use credential::AuthenticatorAssertionResponse;
use starknet::core::types::Felt;

pub mod credential;
pub mod device;
pub mod internal;

pub use device::{DeviceError, DeviceSigner};
pub use internal::InternalWebauthnSigner;

pub type Secp256r1Point = (U256, U256);

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait WebauthnAccountSigner {
    async fn sign(&self, challenge: &[u8]) -> Result<AuthenticatorAssertionResponse, SignError>;
    fn signer_pub_data(&self) -> WebauthnSigner;
    fn sha256_version(&self) -> Sha256Version {
        Sha256Version::Cairo1
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> HashSigner for T
where
    T: WebauthnAccountSigner + Sync,
{
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        let mut challenge = tx_hash.to_bytes_be().to_vec();

        challenge.push(self.sha256_version().encode());
        let assertion = self.sign(&challenge).await?;

        let (type_offset, _) =
            find_value_index_length(&assertion.client_data_json, "type").unwrap();
        let (challenge_offset, challenge_length) =
            find_value_index_length(&assertion.client_data_json, "challenge").unwrap();
        let (origin_offset, origin_length) =
            find_value_index_length(&assertion.client_data_json, "origin").unwrap();

        let transformed_assertion = WebauthnAssertion {
            signature: assertion.signature,
            type_offset: type_offset as u32,
            challenge_offset: challenge_offset as u32,
            challenge_length: challenge_length as u32,
            origin_offset: origin_offset as u32,
            origin_length: origin_length as u32,
            client_data_json: assertion.client_data_json.into_bytes(),
            authenticator_data: assertion.authenticator_data.into(),
        };
        Ok(SignerSignature::Webauthn((
            self.signer_pub_data(),
            transformed_assertion,
        )))
    }
    fn signer(&self) -> Signer {
        Signer::Webauthn(self.signer_pub_data())
    }
}

/// Represents a version of the sha256 algorithm
/// that the contract should use when validating the signature
pub enum Sha256Version {
    /// A faster implementation, but might not always be available
    Cairo0,
    /// A slower implementation, but always available
    Cairo1,
}

impl Sha256Version {
    pub fn encode(&self) -> u8 {
        match self {
            Sha256Version::Cairo0 => 0,
            Sha256Version::Cairo1 => 1,
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
