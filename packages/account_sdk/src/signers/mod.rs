pub mod starknet;
pub mod webauthn;

use ::starknet::{
    core::types::Felt,
    core::{crypto::EcdsaSignError, utils::NonAsciiNameError},
    macros::{selector, short_string},
};

use starknet_crypto::{poseidon_hash, PoseidonHasher};

use crate::abigen::controller::{DeployToken, Signer, SignerSignature};
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
    ) -> Result<SignerSignature, SignError> {
        let message_hash = PedersenHasher::new(Felt::ZERO)
            .update(&selector!("change_owner"))
            .update(chain_id)
            .update(contract_address)
            .update(&3u32.into())
            .finalize();
        self.sign(&message_hash).await
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait DeployTokenSigner: NewOwnerSigner {
    async fn sign_deploy_token(&self, address: &Felt) -> Result<DeployToken, SignError> {
        let signature = self.sign_new_owner(&Felt::ZERO, &address).await?;
        Ok(DeployToken {
            address: address.clone().into(),
            signature,
        })
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait DeployTokenRequestSigner: HashSigner {
    async fn sign_deploy_token_request(
        &self,
        token: &DeployToken,
    ) -> Result<SignerSignature, SignError> {
        let token_hash = PedersenHasher::new(Felt::ZERO)
            .update(&selector!("deploy_token"))
            .update(&token.address.into())
            .update(&token.signature.signer().guid())
            .update(&Felt::TWO)
            .finalize();
        self.sign(&token_hash).await
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> NewOwnerSigner for T where T: HashSigner {}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> DeployTokenSigner for T where T: NewOwnerSigner {}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> DeployTokenRequestSigner for T where T: HashSigner {}

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

pub trait SignerSignatureTrait {
    fn signer(&self) -> Signer;
}

impl SignerSignatureTrait for SignerSignature {
    fn signer(&self) -> Signer {
        match self {
            SignerSignature::Starknet((signer, _)) => Signer::Starknet(signer.clone()),
            SignerSignature::Secp256k1((signer, _)) => Signer::Secp256k1(signer.clone()),
            SignerSignature::Secp256r1((signer, _)) => Signer::Secp256r1(signer.clone()),
            SignerSignature::Eip191((signer, _)) => Signer::Eip191(signer.clone()),
            SignerSignature::Webauthn((signer, _)) => Signer::Webauthn(signer.clone()),
        }
    }
}
