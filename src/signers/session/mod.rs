use crate::account::CartridgeGuardianAccount;

use self::session_hash::Session;

pub mod session_hash;
use async_trait::async_trait;
use starknet::{accounts::Account, providers::Provider};
use starknet_crypto::FieldElement;

use super::{SignError, TransactionHashSigner};

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait SessionSigner {
    async fn sign_session(&self, session: Session) -> Result<Vec<FieldElement>, SignError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, G> SessionSigner for CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: TransactionHashSigner + Send + Sync,
    G: TransactionHashSigner + Send + Sync,
{
    async fn sign_session(&self, session: Session) -> Result<Vec<FieldElement>, SignError> {
        let hash = session
            .raw()
            .get_message_hash_rev_1(self.chain_id(), self.address());

        self.sign_hash(hash).await
    }
}
