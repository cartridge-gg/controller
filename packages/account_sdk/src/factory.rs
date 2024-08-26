use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use starknet::{
    accounts::{
        AccountDeploymentV1, AccountFactory, PreparedAccountDeploymentV1,
        PreparedAccountDeploymentV3, RawAccountDeploymentV1, RawAccountDeploymentV3,
    },
    core::types::{BlockId, BlockTag, Felt},
    providers::Provider,
    signers::SigningKey,
};

use crate::abigen::controller::{Owner, Signer, SignerSignature};
use crate::signers::{HashSigner, SignError};

pub struct ControllerFactory<S, P> {
    class_hash: Felt,
    chain_id: Felt,
    owner: S,
    guardian: Option<SigningKey>,
    provider: P,
    block_id: BlockId,
}

impl<S, P> ControllerFactory<S, P>
where
    S: HashSigner,
{
    pub fn new(
        class_hash: Felt,
        chain_id: Felt,
        owner: S,
        guardian: Option<SigningKey>,
        provider: P,
    ) -> Self {
        Self {
            class_hash,
            chain_id,
            owner,
            guardian,
            provider,
            block_id: BlockId::Tag(BlockTag::Pending),
        }
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<S, P> AccountFactory for ControllerFactory<S, P>
where
    S: HashSigner + Sync + Send,
    P: Provider + Sync + Send,
{
    type Provider = P;
    type SignError = SignError;

    fn class_hash(&self) -> Felt {
        self.class_hash
    }

    fn calldata(&self) -> Vec<Felt> {
        let mut constructor_calldata = Owner::cairo_serialize(&Owner::Signer(self.owner.signer()));
        if let Some(guardian) = &self.guardian {
            constructor_calldata
                .extend(Option::<Signer>::cairo_serialize(&Some(guardian.signer())));
        } else {
            constructor_calldata.extend(Option::<Signer>::cairo_serialize(&None));
        }
        constructor_calldata
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
