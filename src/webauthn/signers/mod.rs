use crate::abigen::cartridge_account::{SignerSignature, WebauthnAssertion, WebauthnSigner};
use crate::signer::AccountSigner;

use super::account::SignError;
use super::credential::AuthenticatorAssertionResponse;
use super::json_helper::find_value_index_length;
use async_trait::async_trait;
use starknet_crypto::FieldElement;

pub mod device;
pub mod p256r1;

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
impl<T> AccountSigner for T
where
    T: WebauthnAccountSigner + Sync,
{
    type SignError = SignError;
    async fn sign(&self, tx_hash: &FieldElement) -> Result<SignerSignature, Self::SignError> {
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
