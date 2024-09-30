use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use starknet::{
    accounts::{Account, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, BlockTag, Call, Felt},
    macros::short_string,
    providers::Provider,
};

use crate::{
    constants::GUARDIAN_SIGNER,
    impl_account, impl_execution_encoder,
    signers::{HashSigner, SignError, Signer},
};

use self::{
    hash::{Policy, Session},
    raw_session::RawSessionToken,
};

use super::AccountHashAndCallsSigner;

pub mod hash;
pub mod merkle;
pub mod raw_session;

pub struct SessionAccount<P>
where
    P: Provider + Send,
{
    provider: P,
    signer: Signer,
    address: Felt,
    chain_id: Felt,
    block_id: BlockId,
    session_authorization: Vec<Felt>,
    session: Session,
}

impl<P> SessionAccount<P>
where
    P: Provider + Send,
{
    pub fn new(
        provider: P,
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
        provider: P,
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

    pub async fn sign(&self, hash: Felt, calls: &[Call]) -> Result<RawSessionToken, SignError> {
        let mut proofs = Vec::new();

        for call in calls {
            let method = Policy {
                selector: call.selector,
                contract_address: call.to,
            };

            let Some(proof) = self.session.single_proof(&method) else {
                return Err(SignError::SessionMethodNotAllowed {
                    selector: method.selector,
                    contract_address: method.contract_address,
                });
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
impl<P> AccountHashAndCallsSigner for SessionAccount<P>
where
    P: Provider + Send + Sync,
{
    async fn sign_hash_and_calls(
        &self,
        hash: Felt,
        calls: &[Call],
    ) -> Result<Vec<Felt>, SignError> {
        let tx_hash = self
            .session
            .message_hash(hash, self.chain_id, self.address)?;
        let result = self.sign(tx_hash, calls).await?;
        Ok([
            vec![Self::session_magic()],
            RawSessionToken::cairo_serialize(&result),
        ]
        .concat())
    }
}

impl_execution_encoder!(SessionAccount<P: Provider>);
impl_account!(SessionAccount<P: Provider>, |_, _| false);

impl<P> ConnectedAccount for SessionAccount<P>
where
    P: Provider + Send + Sync + Clone,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}
