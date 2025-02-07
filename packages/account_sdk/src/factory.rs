use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use starknet::{
    accounts::{
        AccountDeploymentV1, AccountFactory, PreparedAccountDeploymentV1,
        PreparedAccountDeploymentV3, RawAccountDeploymentV1, RawAccountDeploymentV3,
    },
    core::types::{BlockId, BlockTag, Felt},
};

use crate::{
    abigen::controller::SignerSignature,
    provider::CartridgeJsonRpcProvider,
    signers::{HashSigner, Owner, SignError},
};

#[derive(Clone)]
pub struct ControllerFactory {
    class_hash: Felt,
    chain_id: Felt,
    owner: Owner,
    provider: CartridgeJsonRpcProvider,
    block_id: BlockId,
}

impl ControllerFactory {
    pub fn new(
        class_hash: Felt,
        chain_id: Felt,
        owner: Owner,
        provider: CartridgeJsonRpcProvider,
    ) -> Self {
        Self {
            class_hash,
            chain_id,
            owner,
            provider,
            block_id: BlockId::Tag(BlockTag::Pending),
        }
    }

    pub fn address(&self, salt: Felt) -> Felt {
        self.deploy_v3(salt).address()
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl AccountFactory for ControllerFactory {
    type Provider = CartridgeJsonRpcProvider;
    type SignError = SignError;

    fn class_hash(&self) -> Felt {
        self.class_hash
    }

    fn calldata(&self) -> Vec<Felt> {
        let mut calldata =
            crate::abigen::controller::Owner::cairo_serialize(&self.owner.clone().into());
        calldata.push(Felt::ONE); // no guardian
        calldata
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
        let signature = self.owner.sign(&tx_hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![signature]))
    }

    async fn sign_deployment_v3(
        &self,
        deployment: &RawAccountDeploymentV3,
        query_only: bool,
    ) -> Result<Vec<Felt>, Self::SignError> {
        let tx_hash = PreparedAccountDeploymentV3::from_raw(deployment.clone(), self)
            .transaction_hash(query_only);
        let signature = self.owner.sign(&tx_hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![signature]))
    }

    fn deploy_v1(&self, salt: Felt) -> AccountDeploymentV1<'_, Self> {
        AccountDeploymentV1::new(salt, self)
    }
}
