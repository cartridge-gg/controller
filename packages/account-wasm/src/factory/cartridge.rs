use account_sdk::account::AccountHashSigner;
use account_sdk::signers::SignError;
use async_trait::async_trait;
use starknet::{
    core::types::{BlockId, BlockTag, Felt},
    providers::Provider,
};

use super::{AccountFactory, PreparedAccountDeployment, RawAccountDeployment};

pub struct CartridgeAccountFactory<S, P> {
    class_hash: Felt,
    chain_id: Felt,
    calldata: Vec<Felt>,
    signer: S,
    provider: P,
    block_id: BlockId,
}

impl<S, P> CartridgeAccountFactory<S, P>
where
    S: AccountHashSigner,
{
    pub fn new(
        class_hash: Felt,
        chain_id: Felt,
        calldata: Vec<Felt>,
        signer: S,
        provider: P,
    ) -> Self {
        Self {
            class_hash,
            chain_id,
            calldata,
            signer,
            provider,
            block_id: BlockId::Tag(BlockTag::Latest),
        }
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<S, P> AccountFactory for CartridgeAccountFactory<S, P>
where
    S: AccountHashSigner + Sync + Send,
    P: Provider + Sync + Send,
{
    type Provider = P;
    type SignError = SignError;

    fn class_hash(&self) -> Felt {
        self.class_hash
    }

    fn calldata(&self) -> Vec<Felt> {
        self.calldata.clone()
    }

    fn chain_id(&self) -> Felt {
        self.chain_id
    }

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }

    async fn sign_deployment(
        &self,
        deployment: &RawAccountDeployment,
    ) -> Result<Vec<Felt>, Self::SignError> {
        let tx_hash =
            PreparedAccountDeployment::from_raw(deployment.clone(), self).transaction_hash();
        let signature = self.signer.sign_hash(tx_hash).await?;

        Ok(signature)
    }
}
