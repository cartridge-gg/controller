use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use starknet::{
    accounts::{Account, Call, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, BlockTag, FieldElement},
    macros::short_string,
    providers::Provider,
};

use crate::{
    impl_account, impl_execution_encoder,
    signers::{HashSigner, SignError},
};

use self::{
    hash::{AllowedMethod, Session},
    raw_session::RawSessionToken,
};

use super::{AccountHashAndCallsSigner, SpecificAccount};

pub mod create;
pub mod hash;
pub mod merkle;
pub mod raw_session;

pub struct SessionAccount<P, S, G>
where
    P: Provider + Send,
    S: HashSigner + Send,
    G: HashSigner + Send,
{
    provider: P,
    signer: S,
    guardian: G,
    address: FieldElement,
    chain_id: FieldElement,
    block_id: BlockId,
    session_authorization: Vec<FieldElement>,
    session: Session,
}
impl<P, S, G> SessionAccount<P, S, G>
where
    P: Provider + Send,
    S: HashSigner + Send,
    G: HashSigner + Send,
{
    pub fn new(
        provider: P,
        signer: S,
        guardian: G,
        address: FieldElement,
        chain_id: FieldElement,
        session_authorization: Vec<FieldElement>,
        session: Session,
    ) -> Self {
        Self {
            provider,
            signer,
            guardian,
            address,
            chain_id,
            block_id: BlockId::Tag(BlockTag::Latest),
            session_authorization,
            session,
        }
    }
    pub async fn sign(
        &self,
        hash: FieldElement,
        calls: &[Call],
    ) -> Result<RawSessionToken, SignError> {
        let proofs = calls
            .iter()
            .map(|c| AllowedMethod {
                contract_address: c.to,
                selector: c.selector,
            })
            .map(|ref m| self.session.single_proof(m))
            .collect::<Option<Vec<_>>>()
            .ok_or(SignError::SessionMethodNotAllowed)?;
        Ok(RawSessionToken {
            session: self.session.raw(),
            session_authorization: self.session_authorization.clone(),
            session_signature: self.signer.sign(&hash).await?,
            guardian_signature: self.guardian.sign(&hash).await?,
            proofs,
        })
    }
    fn session_magic() -> FieldElement {
        short_string!("session-token")
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, G> AccountHashAndCallsSigner for SessionAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
{
    async fn sign_hash_and_calls(
        &self,
        hash: FieldElement,
        calls: &[Call],
    ) -> Result<Vec<FieldElement>, SignError> {
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

impl<P, S, G> SpecificAccount for SessionAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
{
    fn address(&self) -> FieldElement {
        self.address
    }

    fn chain_id(&self) -> FieldElement {
        self.chain_id
    }
}

impl_execution_encoder!(SessionAccount<P: Provider, S: HashSigner, G: HashSigner>);
impl_account!(SessionAccount<P: Provider, S: HashSigner, G: HashSigner>);

impl<P, S, G> ConnectedAccount for SessionAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}
