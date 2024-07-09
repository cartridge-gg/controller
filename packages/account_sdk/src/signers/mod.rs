pub mod starknet;
pub mod webauthn;

use ::starknet::{
    core::types::Felt,
    core::{crypto::EcdsaSignError, utils::NonAsciiNameError},
    macros::{selector, short_string},
};

use starknet_crypto::{poseidon_hash, PoseidonHasher};

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
    fn signer(&self) -> Signer;
}

pub trait SignerTrait {
    fn guid(&self) -> Felt;
    fn magic(&self) -> Felt;
}

impl SignerTrait for Signer {
    fn guid(&self) -> Felt {
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
    fn magic(&self) -> Felt {
        match self {
            Signer::Starknet(_) => short_string!("Starknet Signer"),
            Signer::Webauthn(_) => short_string!("Webauthn Signer"),
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
        old_owner_guid: &Felt,
    ) -> Result<SignerSignature, SignError> {
        let message_hash = PedersenHasher::new(Felt::ZERO)
            .update(&selector!("change_owner"))
            .update(chain_id)
            .update(contract_address)
            .update(old_owner_guid)
            .update(&4u32.into())
            .finalize();
        self.sign(&message_hash).await
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> NewOwnerSigner for T where T: HashSigner {}

struct PedersenHasher {
    state: Felt,
}

impl PedersenHasher {
    pub fn new(state: Felt) -> Self {
        Self { state }
    }
    pub fn update(&self, data: &Felt) -> Self {
        use starknet_crypto::pedersen_hash;
        Self {
            state: pedersen_hash(&self.state, data),
        }
    }
    pub fn finalize(self) -> Felt {
        self.state
    }
}
