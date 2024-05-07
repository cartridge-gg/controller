pub mod webauthn;

#[derive(Debug, thiserror::Error)]
pub enum SignError {
    #[error("Webauthn error: {0}")]
    Webauthn(webauthn::WebautnSignError),
}

use std::error::Error;

use starknet_crypto::FieldElement;

use crate::abigen::cartridge_account::SignerSignature;
use async_trait::async_trait;

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait AccountSigner {
    #[cfg(not(target_arch = "wasm32"))]
    type SignError: Error + Into<SignError> + Send + Sync;
    #[cfg(target_arch = "wasm32")]
    type SignError: Error + Into<SignError>;

    async fn sign(&self, tx_hash: &FieldElement) -> Result<SignerSignature, Self::SignError>;
}
