pub mod starknet;

#[cfg(feature = "webauthn")]
pub mod webauthn;

use ::starknet::{
    core::{crypto::EcdsaSignError, types::Felt, utils::NonAsciiNameError},
    macros::selector,
    signers::SigningKey,
};
use cainome::cairo_serde::NonZero;

use starknet_crypto::PoseidonHasher;

#[cfg(feature = "webauthn")]
use webauthn::WebauthnSigner;

use crate::abigen::controller::SignerSignature;
use async_trait::async_trait;

#[derive(Debug, Clone)]
pub enum Owner {
    Signer(Signer),
    Account(Felt),
}

impl From<Owner> for crate::abigen::controller::Owner {
    fn from(owner: Owner) -> Self {
        match owner {
            Owner::Signer(signer) => crate::abigen::controller::Owner::Signer(signer.into()),
            Owner::Account(address) => crate::abigen::controller::Owner::Account(address.into()),
        }
    }
}

impl From<Owner> for Felt {
    fn from(owner: Owner) -> Self {
        match owner {
            Owner::Signer(signer) => Felt::from(crate::abigen::controller::Signer::from(signer)),
            Owner::Account(address) => address,
        }
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl HashSigner for Owner {
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        match self {
            Owner::Signer(signer) => signer.sign(tx_hash).await,
            Owner::Account(_) => Err(SignError::AccountOwnerCannotSign),
        }
    }
}

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
}

impl From<Signer> for crate::abigen::controller::Signer {
    fn from(signer: Signer) -> Self {
        match signer {
            Signer::Starknet(s) => crate::abigen::controller::Signer::Starknet(
                crate::abigen::controller::StarknetSigner {
                    pubkey: NonZero::new(s.verifying_key().scalar()).unwrap(),
                },
            ),
            #[cfg(feature = "webauthn")]
            Signer::Webauthn(s) => crate::abigen::controller::Signer::Webauthn(s.into()),
        }
    }
}

impl From<crate::abigen::controller::Signer> for Felt {
    fn from(signer: crate::abigen::controller::Signer) -> Self {
        match signer {
            crate::abigen::controller::Signer::Starknet(s) => s.into(),
            #[cfg(feature = "webauthn")]
            crate::abigen::controller::Signer::Webauthn(s) => s.into(),
            _ => panic!("not implemented"),
        }
    }
}

impl From<Signer> for Felt {
    fn from(signer: Signer) -> Self {
        crate::abigen::controller::Signer::from(signer).into()
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

    #[error("Account owner cannot sign")]
    AccountOwnerCannotSign,
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait HashSigner {
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError>;
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
