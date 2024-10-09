pub mod starknet;

#[cfg(feature = "webauthn")]
pub mod webauthn;

use ::starknet::{
    core::{crypto::EcdsaSignError, types::Felt, utils::NonAsciiNameError},
    macros::{selector, short_string},
    signers::SigningKey,
};

use starknet_crypto::{poseidon_hash, PoseidonHasher};

#[cfg(feature = "webauthn")]
use webauthn::WebauthnSigner;

use crate::abigen::controller::{Signer as AbigenSigner, SignerSignature};
use async_trait::async_trait;

#[derive(Debug, Clone)]
pub enum Signer {
    Starknet(SigningKey),
    #[cfg(feature = "webauthn")]
    Webauthn(WebauthnSigner),
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl HashSigner for Signer {
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        match self {
            Signer::Starknet(s) => HashSigner::sign(s, tx_hash).await,
            #[cfg(feature = "webauthn")]
            Signer::Webauthn(s) => HashSigner::sign(s, tx_hash).await,
        }
    }

    fn signer(&self) -> AbigenSigner {
        match self {
            Signer::Starknet(s) => s.signer(),
            #[cfg(feature = "webauthn")]
            Signer::Webauthn(s) => s.signer(),
        }
    }
}

impl Signer {
    pub fn new_starknet_random() -> Self {
        Self::Starknet(SigningKey::from_random())
    }
}

#[derive(Debug, thiserror::Error)]
pub enum DeviceError {
    #[error("Create credential error: {0}")]
    CreateCredential(String),
    #[error("Get assertion error: {0}")]
    GetAssertion(String),
    #[error("Bad assertion error: {0}")]
    BadAssertion(String),
    #[error("Channel error: {0}")]
    Channel(String),
    #[error("Origin error: {0}")]
    Origin(String),
}

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

    /// Represents an error when trying to perform contract invocation that is not part
    /// of a session's allowed methods.
    #[error(
        "Not allowed to call method selector `{selector:#x}` on contract `{contract_address:#x}`"
    )]
    SessionMethodNotAllowed {
        /// The method selector that was not allowed.
        selector: Felt,
        /// The contract address the method was called on.
        contract_address: Felt,
    },

    #[error("Invalid message provided: {0}")]
    InvalidMessageError(String),
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait HashSigner {
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError>;
    fn signer(&self) -> AbigenSigner;
}

pub trait SignerTrait {
    fn guid(&self) -> Felt;
    fn magic(&self) -> Felt;
}

impl SignerTrait for AbigenSigner {
    fn guid(&self) -> Felt {
        match self {
            AbigenSigner::Starknet(signer) => poseidon_hash(self.magic(), *signer.pubkey.inner()),
            #[cfg(feature = "webauthn")]
            AbigenSigner::Webauthn(signer) => {
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

    fn magic(&self) -> Felt {
        match self {
            AbigenSigner::Starknet(_) => short_string!("Starknet Signer"),
            #[cfg(feature = "webauthn")]
            AbigenSigner::Webauthn(_) => short_string!("Webauthn Signer"),
            _ => unimplemented!(),
        }
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait NewOwnerSigner: HashSigner {
    async fn sign_new_owner(
        &self,
        chain_id: &Felt,
        contract_address: &Felt,
    ) -> Result<SignerSignature, SignError> {
        let mut hasher = PoseidonHasher::new();
        hasher.update(selector!("add_owner"));
        hasher.update(*chain_id);
        hasher.update(*contract_address);
        self.sign(&hasher.finalize()).await
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> NewOwnerSigner for T where T: HashSigner {}
