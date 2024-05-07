pub mod starknet;
pub mod webauthn;

use ::starknet::core::crypto::EcdsaSignError;
use starknet_crypto::FieldElement;

use crate::abigen::cartridge_account::{Signer, SignerSignature};
use async_trait::async_trait;

use self::webauthn::DeviceError;

#[derive(Debug, thiserror::Error)]
pub enum SignError {
    #[error("Signer error: {0}")]
    Signer(EcdsaSignError),
    #[error("Device error: {0}")]
    Device(DeviceError),
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait AccountSigner: Sized {
    async fn sign(&self, tx_hash: &FieldElement) -> Result<SignerSignature, SignError>;
    fn signer(&self) -> Signer;
}
