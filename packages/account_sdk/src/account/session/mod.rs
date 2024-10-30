use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use hash::CallPolicy;
use starknet::{
    accounts::{Account, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, BlockTag, Call, Felt},
    macros::short_string,
};

use crate::{
    constants::GUARDIAN_SIGNER,
    impl_account, impl_execution_encoder,
    provider::CartridgeJsonRpcProvider,
    signers::{HashSigner, SessionPolicyError, SignError, Signer},
};

use self::{
    hash::{Policy, Session},
    raw_session::RawSessionToken,
};

use super::AccountHashAndCallsSigner;

pub mod hash;
pub mod merkle;
pub mod raw_session;

pub struct SessionAccount {
    provider: CartridgeJsonRpcProvider,
    signer: Signer,
    address: Felt,
    chain_id: Felt,
    block_id: BlockId,
    session_authorization: Vec<Felt>,
    session: Session,
}

impl SessionAccount {
    pub fn new(
        provider: CartridgeJsonRpcProvider,
        signer: Signer,
        address: Felt,
        chain_id: Felt,
        session_authorization: Vec<Felt>,
        session: Session,
    ) -> Self {
        Self {
            provider,
            signer,
            address,
            chain_id,
            block_id: BlockId::Tag(BlockTag::Pending),
            session_authorization,
            session,
        }
    }

    pub fn new_as_registered(
        provider: CartridgeJsonRpcProvider,
        signer: Signer,
        address: Felt,
        chain_id: Felt,
        owner_guid: Felt,
        session: Session,
    ) -> Self {
        Self::new(
            provider,
            signer,
            address,
            chain_id,
            vec![short_string!("authorization-by-registered"), owner_guid],
            session,
        )
    }

    pub async fn sign(
        &self,
        hash: Felt,
        policies: &[Policy],
    ) -> Result<RawSessionToken, SignError> {
        let mut proofs = Vec::new();

        for policy in policies {
            let Some(proof) = self.session.single_proof(policy) else {
                return match policy {
                    Policy::Call(method) => Err(SignError::SessionPolicyNotAllowed(
                        SessionPolicyError::MethodNotAllowed {
                            selector: method.selector,
                            contract_address: method.contract_address,
                        },
                    )),
                };
            };

            proofs.push(proof);
        }

        Ok(RawSessionToken {
            session: self.session.raw(),
            cache_authorization: true,
            session_authorization: self.session_authorization.clone(),
            session_signature: self.signer.sign(&hash).await?,
            guardian_signature: GUARDIAN_SIGNER.sign(&hash).await?,
            proofs,
        })
    }

    fn session_magic() -> Felt {
        short_string!("session-token")
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl AccountHashAndCallsSigner for SessionAccount {
    async fn sign_hash_and_calls(
        &self,
        hash: Felt,
        calls: &[Call],
    ) -> Result<Vec<Felt>, SignError> {
        let tx_hash = self
            .session
            .message_hash(hash, self.chain_id, self.address)?;
        let result = self
            .sign(
                tx_hash,
                &calls
                    .iter()
                    .map(CallPolicy::from)
                    .map(Policy::from)
                    .collect::<Vec<_>>(),
            )
            .await?;
        let sig = [
            vec![Self::session_magic()],
            RawSessionToken::cairo_serialize(&result),
        ]
        .concat();
        Ok(sig)
    }
}

impl_execution_encoder!(SessionAccount);
impl_account!(SessionAccount, |_, _| false);

impl ConnectedAccount for SessionAccount {
    type Provider = CartridgeJsonRpcProvider;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}
