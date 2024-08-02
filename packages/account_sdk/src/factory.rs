use async_trait::async_trait;
use starknet::{
    accounts::{
        AccountDeploymentV1, AccountFactory, PreparedAccountDeploymentV1,
        PreparedAccountDeploymentV3, RawAccountDeploymentV1, RawAccountDeploymentV3,
    },
    core::types::{BlockId, BlockTag, Felt},
    providers::Provider,
};

use crate::{account::AccountHashSigner, signers::SignError};

pub struct ControllerFactory<S, P> {
    class_hash: Felt,
    chain_id: Felt,
    calldata: Vec<Felt>,
    signer: S,
    provider: P,
    block_id: BlockId,
}

impl<S, P> ControllerFactory<S, P>
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
impl<S, P> AccountFactory for ControllerFactory<S, P>
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

    fn is_signer_interactive(&self) -> bool {
        true
    }

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }

    async fn sign_deployment_v1(
        &self,
        deployment: &RawAccountDeploymentV1,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        let tx_hash = PreparedAccountDeploymentV1::from_raw(deployment.clone(), self)
            .transaction_hash(query_only);
        let signature = self.signer.sign_hash(tx_hash).await?;

        Ok(signature)
    }

    async fn sign_deployment_v3(
        &self,
        deployment: &RawAccountDeploymentV3,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        let tx_hash = PreparedAccountDeploymentV3::from_raw(deployment.clone(), self)
            .transaction_hash(query_only);
        let signature = self.signer.sign_hash(tx_hash).await?;

        Ok(signature)
    }

    fn deploy_v1(&self, salt: Felt) -> AccountDeploymentV1<'_, Self> {
        AccountDeploymentV1::new(salt, self)
    }
}
