use crate::account::{session::SessionAccount, CartridgeGuardianAccount};

use self::session_hash::{AllowedMethod, Session};

pub mod session_hash;
use async_trait::async_trait;
use starknet::{accounts::Account, providers::Provider};
use starknet_crypto::FieldElement;

use super::{SignError, TransactionHashSigner};

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait SessionRequestSigner<P, S, G>
where
    P: Provider + Send + Sync,
    S: TransactionHashSigner + Send + Sync,
    G: TransactionHashSigner + Send + Sync,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<FieldElement>, SignError>;
    async fn session_account(
        &self,
        signer: S,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<SessionAccount<P, S, G>, SignError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, G> SessionRequestSigner<P, S, G> for CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send + Sync + Clone,
    S: TransactionHashSigner + Send + Sync,
    G: TransactionHashSigner + Send + Sync + Clone,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<FieldElement>, SignError> {
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.chain_id(), self.address());

        self.sign_hash(hash).await
    }
    async fn session_account(
        &self,
        signer: S,
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
    ) -> Result<SessionAccount<P, S, G>, SignError> {
        let session = Session::new(allowed_methods, expires_at, &signer.signer());
        let session_authorization = self.sign_session(session.clone()).await?;
        Ok(SessionAccount::new(
            self.account.provider.clone(),
            signer,
            self.guardian.clone(),
            self.chain_id(),
            self.address(),
            session_authorization,
            session,
        ))
    }
}
