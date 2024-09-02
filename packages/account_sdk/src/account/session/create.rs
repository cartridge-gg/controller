use crate::{
    account::{session::SessionAccount, AccountHashSigner, OwnerAccount},
    hash::MessageHashRev1,
    signers::Signer,
};

use super::hash::{AllowedMethod, Session};

use async_trait::async_trait;
use starknet::core::types::Felt;
use starknet::{accounts::Account, providers::Provider};

use super::{HashSigner, SignError};

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait SessionCreator<P>
where
    P: Provider + Send + Sync,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<Felt>, SignError>;
    async fn session_account(
        &self,
        signer: Signer,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<SessionAccount<P>, SignError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P> SessionCreator<P> for OwnerAccount<P>
where
    P: Provider + Send + Sync + Clone,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<Felt>, SignError> {
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.chain_id(), self.address());

        self.sign_hash(hash).await
    }

    async fn session_account(
        &self,
        signer: Signer,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<SessionAccount<P>, SignError> {
        let session = Session::new(allowed_methods, expires_at, &signer.signer())?;
        let session_authorization =
            <OwnerAccount<P> as SessionCreator<P>>::sign_session(self, session.clone()).await?;

        Ok(SessionAccount::new(
            self.provider.clone(),
            signer,
            self.guardian.clone(),
            self.address(),
            self.chain_id(),
            session_authorization,
            session,
        ))
    }
}
