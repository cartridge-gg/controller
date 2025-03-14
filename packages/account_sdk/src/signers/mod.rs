pub mod eip191;
pub mod starknet;

#[cfg(feature = "webauthn")]
pub mod webauthn;

use ::starknet::{
    core::{crypto::EcdsaSignError, types::Felt, utils::NonAsciiNameError},
    macros::{selector, short_string},
    signers::SigningKey,
};
use cainome::cairo_serde::NonZero;

use starknet_crypto::PoseidonHasher;

#[cfg(feature = "webauthn")]
use webauthn::WebauthnSigner;

use crate::abigen::controller::SignerSignature;
use async_trait::async_trait;

use self::eip191::Eip191Signer;

#[derive(Debug, Clone, PartialEq)]
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
    Eip191(Eip191Signer),
}

impl PartialEq for Signer {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Self::Starknet(_), Self::Starknet(_)) => true, // We can't compare SigningKey directly
            #[cfg(feature = "webauthn")]
            (Self::Webauthn(_), Self::Webauthn(_)) => true, // We can't compare WebauthnSigner directly
            (Self::Eip191(a), Self::Eip191(b)) => a == b,
            _ => false,
        }
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl HashSigner for Signer {
    async fn sign(&self, tx_hash: &Felt) -> Result<SignerSignature, SignError> {
        match self {
            Signer::Starknet(s) => HashSigner::sign(s, tx_hash).await,
            #[cfg(feature = "webauthn")]
            Signer::Webauthn(s) => HashSigner::sign(s, tx_hash).await,
            Signer::Eip191(s) => HashSigner::sign(s, tx_hash).await,
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
            Signer::Eip191(s) => {
                crate::abigen::controller::Signer::Eip191(crate::abigen::controller::Eip191Signer {
                    eth_address: cainome::cairo_serde::EthAddress(s.address().into()),
                })
            }
        }
    }
}

impl From<crate::abigen::controller::Signer> for Felt {
    fn from(signer: crate::abigen::controller::Signer) -> Self {
        match signer {
            crate::abigen::controller::Signer::Starknet(s) => s.into(),
            #[cfg(feature = "webauthn")]
            crate::abigen::controller::Signer::Webauthn(s) => s.into(),
            crate::abigen::controller::Signer::Eip191(s) => {
                starknet_crypto::poseidon_hash(short_string!("Eip191 Signer"), s.eth_address.0)
            }
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

    #[cfg(not(target_arch = "wasm32"))]
    pub fn new_eip191_random() -> Self {
        Self::Eip191(Eip191Signer::random())
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

    #[error("Non ascii name error: {0}")]
    NonAsciiSessionNameError(#[from] NonAsciiNameError),

    #[error("No allowed session methods error")]
    NoAllowedSessionMethods,

    #[error("Session policy not allowed error: {0}")]
    SessionPolicyNotAllowed(SessionPolicyError),

    #[error("Invalid message provided: {0}")]
    InvalidMessageError(String),

    #[error("Account owner cannot sign")]
    AccountOwnerCannotSign,
}

#[derive(Debug, thiserror::Error)]
pub enum SessionPolicyError {
    /// Represents an error when trying to perform contract invocation that is not part
    /// of a session's allowed methods.
    #[error(
        "Not allowed to call method selector `{selector:#x}` on contract `{contract_address:#x}`"
    )]
    MethodNotAllowed {
        /// The method selector that was not allowed.
        selector: Felt,
        /// The contract address the method was called on.
        contract_address: Felt,
    },
    #[error("Not allowed to sign TypedData with hash `{scope_hash:#x}`")]
    TypedDataNotAllowed { scope_hash: Felt },
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
