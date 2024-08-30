use crate::{
    account::{session::SessionAccount, AccountHashSigner},
    controller::{Backend, Controller},
    hash::MessageHashRev1,
    provider::CartridgeProvider,
};

use super::hash::{AllowedMethod, Session};

use async_trait::async_trait;
use starknet::core::types::Felt;

use super::{HashSigner, SignError};

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait SessionCreator<P, S>
where
    P: CartridgeProvider + Send + Sync,
    S: HashSigner + Send + Sync,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<Felt>, SignError>;
    async fn create_session_account(
        &self,
        signer: S,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<SessionAccount<P, S>, SignError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, Q, B> SessionCreator<P, Q> for Controller<P, S, B>
where
    P: CartridgeProvider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    Q: HashSigner + Send + Sync + 'static, // 'static is required for async_trait macro
    B: Backend + Clone,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<Felt>, SignError> {
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.chain_id, self.address);

        self.sign_hash(hash).await
    }

    async fn create_session_account(
        &self,
        signer: Q,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<SessionAccount<P, Q>, SignError> {
        let session = Session::new(allowed_methods, expires_at, &signer.signer())?;
        let session_authorization =
            <Controller<P, S, B> as SessionCreator<P, Q>>::sign_session(self, session.clone())
                .await?;

        Ok(SessionAccount::new(
            self.provider.clone(),
            signer,
            self.guardian.clone(),
            self.address,
            self.chain_id,
            session_authorization,
            session,
        ))
    }
}
