use account_sdk::account::AccountHashSigner;
use account_sdk::signers::SignError;
use async_trait::async_trait;
use starknet::{
    core::types::{BlockId, BlockTag, FieldElement},
    providers::Provider,
};

use super::{AccountFactory, PreparedAccountDeployment, RawAccountDeployment};

pub struct CartridgeAccountFactory<S, P> {
    class_hash: FieldElement,
    chain_id: FieldElement,
    calldata: Vec<FieldElement>,
    signer: S,
    provider: P,
    block_id: BlockId,
}

impl<S, P> CartridgeAccountFactory<S, P>
where
    S: AccountHashSigner,
{
    pub fn new(
        class_hash: FieldElement,
        chain_id: FieldElement,
        calldata: Vec<FieldElement>,
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

    fn class_hash(&self) -> FieldElement {
        self.class_hash
    }

    fn calldata(&self) -> Vec<FieldElement> {
        self.calldata.clone()
    }

    fn chain_id(&self) -> FieldElement {
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
    ) -> Result<Vec<FieldElement>, Self::SignError> {
        let tx_hash =
            PreparedAccountDeployment::from_raw(deployment.clone(), self).transaction_hash();
        let signature = self.signer.sign_hash(tx_hash).await?;

        Ok(signature)
    }
}
