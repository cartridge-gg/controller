pub mod starknet;
pub mod webauthn;

use ::starknet::{
    accounts::RawExecution,
    core::{crypto::EcdsaSignError, utils::NonAsciiNameError},
    macros::short_string,
};
use starknet_crypto::{poseidon_hash, FieldElement};

use crate::abigen::cartridge_account::{Signer, SignerSignature};
use async_trait::async_trait;

use self::webauthn::DeviceError;

#[derive(Debug, thiserror::Error)]
pub enum SignError {
    #[error("Signer error: {0}")]
    Signer(EcdsaSignError),
    #[error("Device error: {0}")]
    Device(DeviceError),
    #[error("NonAsciiName error: {0}")]
    NonAsciiSessionNameError(#[from] NonAsciiNameError),
    #[error("NoAllowedSessionMethods error")]
    NoAllowedSessionMethods,
    #[error("MethodNotAllowed error")]
    MethodNotAllowed,
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait TransactionHashSigner {
    async fn sign(&self, tx_hash: &FieldElement) -> Result<SignerSignature, SignError>;
    fn signer(&self) -> Signer;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait SimpleTransactionExecutionSigner {
    async fn sign(
        &self,
        execution: &RawExecution,
        tx_hash: &FieldElement,
    ) -> Result<Vec<FieldElement>, SignError>;
}

pub trait SignerTrait {
    fn into_guid(&self) -> FieldElement;
    fn magic(&self) -> FieldElement;
}

impl SignerTrait for Signer {
    fn into_guid(&self) -> FieldElement {
        match self {
            Signer::Starknet(signer) => poseidon_hash(self.magic(), signer.pubkey.inner().clone()),
            _ => unimplemented!(),
        }
    }
    fn magic(&self) -> FieldElement {
        match self {
            Signer::Starknet(_) => short_string!("Starknet Signer"),
            Signer::Webauthn(_) => short_string!("Webauthn Signer"),
            _ => unimplemented!(),
        }
    }
}
