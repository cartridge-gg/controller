pub mod starknet;
pub mod webauthn;

use ::starknet::{
    core::{crypto::EcdsaSignError, utils::NonAsciiNameError},
    macros::short_string,
};
use starknet_crypto::{poseidon_hash, FieldElement, PoseidonHasher};

use crate::abigen::controller::{Signer, SignerSignature};
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
    SessionMethodNotAllowed,
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait HashSigner {
    async fn sign(&self, tx_hash: &FieldElement) -> Result<SignerSignature, SignError>;
    fn signer(&self) -> Signer;
}

pub trait SignerTrait {
    fn guid(&self) -> FieldElement;
    fn magic(&self) -> FieldElement;
}

impl SignerTrait for Signer {
    fn guid(&self) -> FieldElement {
        match self {
            Signer::Starknet(signer) => poseidon_hash(self.magic(), *signer.pubkey.inner()),
            Signer::Webauthn(signer) => {
                let mut state = PoseidonHasher::new();
                state.update(self.magic());
                state.update(signer.origin.len().into());
                for b in &signer.origin {
                    state.update((*b).into())
                }
                let rp_id_hash = signer.rp_id_hash.inner();
                state.update(rp_id_hash.low.into());
                state.update(rp_id_hash.high.into());
                let pub_key = signer.pubkey.inner();
                state.update(pub_key.low.into());
                state.update(pub_key.high.into());
                state.finalize()
            }
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
