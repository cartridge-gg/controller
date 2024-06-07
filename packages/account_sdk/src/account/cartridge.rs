use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use starknet::{
    accounts::{Account, Call, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, BlockTag, FieldElement},
    providers::Provider,
};

use crate::{
    abigen::cartridge_account::SignerSignature,
    impl_account, impl_execution_encoder,
    signers::{HashSigner, SignError},
};

use super::{AccountHashAndCallsSigner, AccountHashSigner, SpecificAccount};

#[derive(Clone, Debug)]
pub struct CartridgeAccount<P, S>
where
    P: Provider + Send,
    S: HashSigner + Send,
{
    pub(crate) provider: P,
    pub(crate) signer: S,
    pub(crate) address: FieldElement,
    pub(crate) chain_id: FieldElement,
    pub(crate) block_id: BlockId,
}
impl<P, S> CartridgeAccount<P, S>
where
    P: Provider + Send,
    S: HashSigner + Send,
{
    pub fn new(provider: P, signer: S, address: FieldElement, chain_id: FieldElement) -> Self {
        Self {
            provider,
            signer,
            address,
            chain_id,
            block_id: BlockId::Tag(BlockTag::Latest),
        }
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P, S> AccountHashSigner for CartridgeAccount<P, S>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
{
    async fn sign_hash(&self, hash: FieldElement) -> Result<Vec<FieldElement>, SignError> {
        let result = self.signer.sign(&hash).await.ok().unwrap();
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![result]))
    }
}

impl<P, S> SpecificAccount for CartridgeAccount<P, S>
where
    P: Provider + Send,
    S: HashSigner + Send,
{
    fn address(&self) -> FieldElement {
        self.address
    }

    fn chain_id(&self) -> FieldElement {
        self.chain_id
    }
}

impl_account!(CartridgeAccount<P: Provider, S: HashSigner>);
impl_execution_encoder!(CartridgeAccount<P: Provider, S: HashSigner>);

impl<P, S> ConnectedAccount for CartridgeAccount<P, S>
where
    P: Provider + Send + Sync,
    S: HashSigner + Send + Sync,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}
