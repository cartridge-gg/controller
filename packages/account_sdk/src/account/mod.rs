use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use cainome::cairo_serde::ContractAddress;
use starknet::core::types::Call;
use starknet::macros::selector;
use starknet::{
    accounts::{Account, ConnectedAccount, ExecutionEncoder},
    core::types::{BlockId, BlockTag, Felt},
    providers::Provider,
};

pub mod macros;
pub mod outside_execution;
pub mod session;

use crate::controller::GUARDIAN_SIGNER;
use crate::signers::Signer;
use crate::{abigen, typed_data::TypedData};
use crate::{
    abigen::controller::SignerSignature,
    impl_account, impl_execution_encoder,
    signers::{HashSigner, SignError},
};

#[derive(Clone, Debug)]
pub struct OwnerAccount<P>
where
    P: Provider + Send,
{
    pub provider: P,
    pub(crate) signer: Signer,
    pub address: Felt,
    pub chain_id: Felt,
    pub(crate) block_id: BlockId,
}

impl<P> OwnerAccount<P>
where
    P: Provider + Send,
{
    pub fn new(provider: P, signer: Signer, address: Felt, chain_id: Felt) -> Self {
        OwnerAccount {
            provider,
            signer,
            address,
            chain_id,
            block_id: BlockId::Tag(BlockTag::Pending),
        }
    }

    pub fn set_signer(&mut self, new_signer: Signer) {
        self.signer = new_signer;
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P> AccountHashSigner for OwnerAccount<P>
where
    P: Provider + Send + Sync,
{
    async fn sign_hash(&self, hash: Felt) -> Result<Vec<Felt>, SignError> {
        let owner_signature = self.signer.sign(&hash).await?;
        let guardian_signature = GUARDIAN_SIGNER.sign(&hash).await?;
        Ok(Vec::<SignerSignature>::cairo_serialize(&vec![
            owner_signature,
            guardian_signature,
        ]))
    }
}

impl<P> SpecificAccount for OwnerAccount<P>
where
    P: Provider + Send + Sync,
{
    fn address(&self) -> Felt {
        self.address
    }

    fn chain_id(&self) -> Felt {
        self.chain_id
    }
}

impl_account!(OwnerAccount<P: Provider>, |_, _| {
    true
});
impl_execution_encoder!(OwnerAccount<P: Provider>);

impl<P> ConnectedAccount for OwnerAccount<P>
where
    P: Provider + Send + Sync + Clone,
{
    type Provider = P;

    fn provider(&self) -> &Self::Provider {
        &self.provider
    }

    fn block_id(&self) -> BlockId {
        self.block_id
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait AccountHashSigner {
    async fn sign_hash(&self, hash: Felt) -> Result<Vec<Felt>, SignError>;
}

pub enum CallEncoder {}

impl CallEncoder {
    pub fn encode_calls(calls: &[Call]) -> Vec<Felt> {
        <Vec<abigen::controller::Call> as CairoSerde>::cairo_serialize(
            &calls
                .iter()
                .map(
                    |Call {
                         to,
                         selector,
                         calldata,
                     }| abigen::controller::Call {
                        to: ContractAddress(*to),
                        selector: *selector,
                        calldata: calldata.clone(),
                    },
                )
                .collect(),
        )
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait AccountHashAndCallsSigner {
    async fn sign_hash_and_calls(&self, hash: Felt, calls: &[Call])
        -> Result<Vec<Felt>, SignError>;
}

pub trait SpecificAccount {
    fn address(&self) -> Felt;
    fn chain_id(&self) -> Felt;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<P> AccountHashAndCallsSigner for OwnerAccount<P>
where
    P: Provider + Send + Sync,
{
    async fn sign_hash_and_calls(
        &self,
        hash: Felt,
        _calls: &[Call],
    ) -> Result<Vec<Felt>, SignError> {
        self.sign_hash(hash).await
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait MessageSignerAccount {
    async fn sign_message(&self, data: TypedData) -> Result<Vec<Felt>, SignError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> MessageSignerAccount for T
where
    T: AccountHashSigner + SpecificAccount + Sync,
{
    async fn sign_message(&self, data: TypedData) -> Result<Vec<Felt>, SignError> {
        let hash = data.encode(self.address())?;
        self.sign_hash(hash).await
    }
}

pub const DECLARATION_SELECTOR: Felt = selector!("__declare_transaction__");
