pub mod starknet;
pub mod webauthn;

use ::starknet::{accounts::RawExecution, core::crypto::EcdsaSignError};
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
pub trait TransactionHashSigner {
    async fn sign(&self, tx_hash: &FieldElement) -> Result<SignerSignature, SignError>;
    fn signer(&self) -> Signer;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait TransactionExecutionSigner {
    async fn sign(&self, execution: &RawExecution, tx_hash: &FieldElement) -> Result<SignerSignature, SignError>;
    fn signer(&self) -> Signer;
}

#[cfg(not(target_arch = "wasm32"))]
#[async_trait]
impl<T> TransactionExecutionSigner for T
where
    T: TransactionHashSigner + Send + Sync,
{
    async fn sign(&self, _execution: &RawExecution, tx_hash: &FieldElement) -> Result<SignerSignature, SignError> {
        self.sign(tx_hash).await
    }

    fn signer(&self) -> Signer {
        self.signer()
    }
}

#[cfg(target_arch = "wasm32")]
#[async_trait(?Send)]
impl<T> TransactionExecutionSigner for T
where
    T: TransactionHashSigner,
{
    async fn sign(&self, _execution: &RawExecution, tx_hash: &FieldElement) -> Result<SignerSignature, SignError> {
        self.sign(tx_hash).await
    }

    fn signer(&self) -> Signer {
        self.signer()
    }
}
