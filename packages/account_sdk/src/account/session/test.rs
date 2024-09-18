use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use starknet::{
    accounts::{Account, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, BlockTag, Call, Felt},
    macros::short_string,
    providers::Provider,
};

use crate::{
    account::{AccountHashSigner, OwnerAccount},
    hash::MessageHashRev1,
    impl_account, impl_execution_encoder,
    signers::{HashSigner, SignError, Signer},
};

use super::{
    hash::{AllowedMethod, Session},
    raw_session::RawSessionToken,
};

use super::{AccountHashAndCallsSigner, SpecificAccount};

pub struct MalliableSessionAccount<P>
where
    P: Provider + Send,
{
    provider: P,
    signer: Signer,
    guardian: Signer,
    address: Felt,
    chain_id: Felt,
    block_id: BlockId,
    session_authorization: Vec<Felt>,
    session: Session,
}

impl<P> MalliableSessionAccount<P>
where
    P: Provider + Send,
{
    pub fn new(
        provider: P,
        signer: Signer,
        guardian: Signer,
        address: Felt,
        chain_id: Felt,
        session_authorization: Vec<Felt>,
        session: Session,
    ) -> Self {
        Self {
            provider,
            signer,
            guardian,
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
        guardian: Signer,
        address: Felt,
        chain_id: Felt,
        owner_guid: Felt,
        session: Session,
    ) -> Self {
        Self::new(
            provider,
            signer,
            guardian,
            address,
            chain_id,
            vec![short_string!("authorization-by-registered"), owner_guid],
            session,
        )
    }

    pub async fn sign(&self, hash: Felt, calls: &[Call]) -> Result<RawSessionToken, SignError> {
        let mut proofs = Vec::new();

        for call in calls {
            let method = AllowedMethod {
                selector: call.selector,
                contract_address: call.to,
            };

            let proof = self.session.single_proof(&method).unwrap_or(
                self.session
                    .single_proof(&self.session.allowed_methods[0].method)
                    .unwrap(),
            );

            proofs.push(proof);
        }

        Ok(RawSessionToken {
            session: self.session.raw(),
            cache_authorization: true,
            session_authorization: self.session_authorization.clone(),
            session_signature: self.signer.sign(&hash).await?,
            guardian_signature: self.guardian.sign(&hash).await?,
            proofs,
        })
    }

    fn session_magic() -> Felt {
        short_string!("session-token")
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P> AccountHashAndCallsSigner for MalliableSessionAccount<P>
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

impl<P> SpecificAccount for MalliableSessionAccount<P>
where
    P: Provider + Send + Sync,
{
    fn address(&self) -> Felt {
        self.address
    }

    fn chain_id(&self) -> Felt {
        self.chain_id
    }
}

impl_execution_encoder!(MalliableSessionAccount<P: Provider>);
impl_account!(MalliableSessionAccount<P: Provider>, |_, _| false);

impl<P> ConnectedAccount for MalliableSessionAccount<P>
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

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait MalliableSessionCreator<P>
where
    P: Provider + Send + Sync,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<Felt>, SignError>;
    async fn malliable_session_account(
        &self,
        signer: Signer,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<MalliableSessionAccount<P>, SignError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P> MalliableSessionCreator<P> for OwnerAccount<P>
where
    P: Provider + Send + Sync + Clone,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<Felt>, SignError> {
        let hash = session.raw().get_message_hash_rev_1(
            SpecificAccount::chain_id(self),
            SpecificAccount::address(self),
        );

        self.sign_hash(hash).await
    }

    async fn malliable_session_account(
        &self,
        signer: Signer,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<MalliableSessionAccount<P>, SignError> {
        let session = Session::new(allowed_methods, expires_at, &signer.signer())?;
        let session_authorization =
            <OwnerAccount<P> as MalliableSessionCreator<P>>::sign_session(self, session.clone())
                .await?;

        Ok(MalliableSessionAccount::new(
            self.provider.clone(),
            signer,
            self.guardian.clone(),
            SpecificAccount::address(self),
            SpecificAccount::chain_id(self),
            session_authorization,
            session,
        ))
    }
}
