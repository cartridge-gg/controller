use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use starknet::{
    accounts::{Account, Call, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, Felt},
    providers::Provider,
};

use crate::{
    abigen::controller::SignerSignature,
    impl_account, impl_execution_encoder,
    signers::{HashSigner, SignError},
};

use super::{
    cartridge::CartridgeAccount, AccountHashAndCallsSigner, AccountHashSigner, SpecificAccount,
};

#[derive(Clone, Debug)]
pub struct CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send,
    S: HashSigner + Send,
    G: HashSigner + Send,
{
    pub(crate) account: CartridgeAccount<P, S>,
    pub(crate) guardian: G,
}

impl<P, S, G> CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send,
    S: HashSigner + Send,
    G: HashSigner + Send,
{
    pub fn new(provider: P, signer: S, guardian: G, address: Felt, chain_id: Felt) -> Self {
        CartridgeGuardianAccount {
            account: CartridgeAccount::new(provider, signer, address, chain_id),
            guardian,
        }
    }
    pub fn from_account(account: CartridgeAccount<P, S>, guardian: G) -> Self {
        Self { account, guardian }
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S, G> AccountHashSigner for CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
{
    async fn sign_hash(&self, hash: Felt) -> Result<Vec<Felt>, SignError> {
        let owner_signature = self.account.signer.sign(&hash).await?;
        let guardian_signature = self.guardian.sign(&hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![
            owner_signature,
            guardian_signature,
        ]))
    }
}

impl<P, S, G> SpecificAccount for CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
{
    fn address(&self) -> Felt {
        self.account.address
    }

    fn chain_id(&self) -> Felt {
        self.account.chain_id
    }
}

impl_account!(CartridgeGuardianAccount<P: Provider, S: HashSigner, G: HashSigner>);
impl_execution_encoder!(CartridgeGuardianAccount<P: Provider, S: HashSigner, G: HashSigner>);

impl<P, S, G> ConnectedAccount for CartridgeGuardianAccount<P, S, G>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
    G: HashSigner + Send + Sync,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        self.account.provider()
    }

    fn block_id(&self) -> BlockId {
        self.account.block_id()
    }
}
