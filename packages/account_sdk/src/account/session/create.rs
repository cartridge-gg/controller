use crate::{
    account::{
        session::SessionAccount, AccountHashSigner, CartridgeAccount, CartridgeGuardianAccount,
    },
    hash::MessageHashRev1,
};

use super::hash::{AllowedMethod, Session};

use async_trait::async_trait;
use starknet::{accounts::Account, providers::Provider};
use starknet::{core::types::Felt, signers::SigningKey};

use super::{HashSigner, SignError};

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait SessionCreator<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<Felt>, SignError>;
    async fn session_account(
        &self,
        signer: S,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<SessionAccount<P, S, G>, SignError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, Q, G> SessionCreator<P, Q, G> for CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send + Sync + Clone,
    S: HashSigner + Send + Sync + Clone,
    Q: HashSigner + Send + Sync + 'static, // 'static is required for async_trait macro
    G: HashSigner + Send + Sync + Clone,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<Felt>, SignError> {
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.chain_id(), self.address());

        self.sign_hash(hash).await
    }

    async fn session_account(
        &self,
        signer: Q,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<SessionAccount<P, Q, G>, SignError> {
        let session = Session::new(allowed_methods, expires_at, &signer.signer())?;
        let session_authorization = <CartridgeGuardianAccount<P, S, G> as SessionCreator<
            P,
            Q,
            G,
        >>::sign_session(self, session.clone())
        .await?;

        Ok(SessionAccount::new(
            self.account.provider.clone(),
            signer,
            self.guardian.clone(),
            self.address(),
            self.chain_id(),
            session_authorization,
            session,
        ))
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, Q> SessionCreator<P, Q, SigningKey> for CartridgeAccount<P, S>
where
    P: Provider + Send + Sync + Clone,
    S: HashSigner + Send + Sync,
    Q: HashSigner + Send + Sync + 'static, // 'static is required for async_trait macro
{
    async fn sign_session(&self, session: Session) -> Result<Vec<Felt>, SignError> {
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.chain_id(), self.address());

        self.sign_hash(hash).await
    }

    async fn session_account(
        &self,
        signer: Q,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<SessionAccount<P, Q, SigningKey>, SignError> {
        let session = Session::new(allowed_methods, expires_at, &signer.signer())?;
        let session_authorization =
            <CartridgeAccount<P, S> as SessionCreator<P, Q, SigningKey>>::sign_session(
                self,
                session.clone(),
            )
            .await?;

        let dummy_guardian = SigningKey::from_random();
        Ok(SessionAccount::new(
            self.provider.clone(),
            signer,
            dummy_guardian,
            self.address(),
            self.chain_id(),
            session_authorization,
            session,
        ))
    }
}
