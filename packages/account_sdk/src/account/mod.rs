use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use cainome::cairo_serde::ContractAddress;
use starknet::core::types::Call;
use starknet::core::types::Felt;
use starknet::macros::selector;

pub mod macros;
pub mod outside_execution;
pub mod session;

use crate::signers::SignError;
use crate::{abigen, typed_data::TypedData};

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
