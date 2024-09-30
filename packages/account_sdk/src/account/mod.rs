use async_trait::async_trait;
use cainome::cairo_serde::CairoSerde;
use cainome::cairo_serde::ContractAddress;
use starknet::core::types::Call;
use starknet::core::types::Felt;
use starknet::macros::selector;

pub mod macros;
pub mod outside_execution;
pub mod session;

use crate::abigen;
use crate::signers::SignError;

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

pub const DECLARATION_SELECTOR: Felt = selector!("__declare_transaction__");
