use async_trait::async_trait;
use cainome::cairo_serde::ContractAddress;
use cainome::cairo_serde::{CairoSerde, Result as CairoSerdeResult};
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use starknet::accounts::Account;
use starknet::core::types::{Call, Felt};
use starknet::macros::{selector, short_string};

use super::AccountHashAndCallsSigner;

use super::outside_execution_v2::OutsideExecutionV2;
use crate::abigen::controller::{Call as AbigenCall, OutsideExecutionV3};
use crate::hash::MessageHashRev1;
use crate::signers::SignError;

#[derive(Clone, Debug)]
pub enum OutsideExecution {
    V2(OutsideExecutionV2),
    V3(OutsideExecutionV3),
}

impl OutsideExecution {
    pub fn caller(&self) -> ContractAddress {
        match self {
            OutsideExecution::V2(v2) => v2.caller,
            OutsideExecution::V3(v3) => v3.caller,
        }
    }
}

impl Serialize for OutsideExecution {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            OutsideExecution::V2(v2) => v2.serialize(serializer),
            OutsideExecution::V3(v3) => v3.serialize(serializer),
        }
    }
}

impl<'de> Deserialize<'de> for OutsideExecution {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let value = serde_json::Value::deserialize(deserializer)?;
        if let Ok(v2) = OutsideExecutionV2::deserialize(&value) {
            Ok(OutsideExecution::V2(v2))
        } else if let Ok(v3) = OutsideExecutionV3::deserialize(&value) {
            Ok(OutsideExecution::V3(v3))
        } else {
            Err(serde::de::Error::custom("Invalid OutsideExecution format"))
        }
    }
}

impl CairoSerde for OutsideExecution {
    type RustType = Self;
    const SERIALIZED_SIZE: Option<usize> = None;

    fn cairo_serialized_size(__rust: &Self::RustType) -> usize {
        match __rust {
            OutsideExecution::V2(v2) => OutsideExecutionV2::cairo_serialized_size(v2),
            OutsideExecution::V3(v3) => OutsideExecutionV3::cairo_serialized_size(v3),
        }
    }

    fn cairo_serialize(__rust: &Self::RustType) -> Vec<Felt> {
        match __rust {
            OutsideExecution::V2(v2) => OutsideExecutionV2::cairo_serialize(v2),
            OutsideExecution::V3(v3) => OutsideExecutionV3::cairo_serialize(v3),
        }
    }

    fn cairo_deserialize(__felts: &[Felt], __offset: usize) -> CairoSerdeResult<Self::RustType> {
        // Try to deserialize as V3 first, then V2
        if let Ok(v3) = OutsideExecutionV3::cairo_deserialize(__felts, __offset) {
            Ok(OutsideExecution::V3(v3))
        } else if let Ok(v2) = OutsideExecutionV2::cairo_deserialize(__felts, __offset) {
            Ok(OutsideExecution::V2(v2))
        } else {
            Err(cainome::cairo_serde::Error::Deserialize(
                "Invalid OutsideExecution format".to_string(),
            ))
        }
    }
}

impl MessageHashRev1 for OutsideExecution {
    fn get_message_hash_rev_1(&self, chain_id: Felt, contract_address: Felt) -> Felt {
        match self {
            OutsideExecution::V2(v2) => v2.get_message_hash_rev_1(chain_id, contract_address),
            OutsideExecution::V3(v3) => v3.get_message_hash_rev_1(chain_id, contract_address),
        }
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait OutsideExecutionAccount {
    async fn sign_outside_execution(
        &self,
        outside_execution: OutsideExecution,
    ) -> Result<SignedOutsideExecution, SignError>;
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> OutsideExecutionAccount for T
where
    T: AccountHashAndCallsSigner + Sync + Account,
{
    async fn sign_outside_execution(
        &self,
        outside_execution: OutsideExecution,
    ) -> Result<SignedOutsideExecution, SignError> {
        let signature = self
            .sign_hash_and_calls(
                outside_execution.get_message_hash_rev_1(self.chain_id(), self.address()),
                &match &outside_execution {
                    OutsideExecution::V2(v2) => v2
                        .calls
                        .iter()
                        .cloned()
                        .map(Call::from)
                        .collect::<Vec<Call>>(),
                    OutsideExecution::V3(v3) => v3
                        .calls
                        .iter()
                        .cloned()
                        .map(Call::from)
                        .collect::<Vec<Call>>(),
                },
            )
            .await?;

        Ok(SignedOutsideExecution {
            outside_execution,
            signature,
            contract_address: self.address(),
        })
    }
}

#[derive(Clone, Debug)]
pub struct SignedOutsideExecution {
    pub outside_execution: OutsideExecution,
    pub signature: Vec<Felt>,
    pub contract_address: Felt,
}

impl From<SignedOutsideExecution> for Call {
    fn from(value: SignedOutsideExecution) -> Self {
        match value.outside_execution {
            OutsideExecution::V3(v3) => Call {
                to: value.contract_address,
                selector: selector!("execute_from_outside_v3"),
                calldata: [
                    <OutsideExecutionV3 as CairoSerde>::cairo_serialize(&v3),
                    <Vec<Felt> as CairoSerde>::cairo_serialize(&value.signature),
                ]
                .concat(),
            },
            OutsideExecution::V2(v2) => Call {
                to: value.contract_address,
                selector: selector!("execute_from_outside_v2"),
                calldata: [
                    <OutsideExecutionV2 as CairoSerde>::cairo_serialize(&v2),
                    <Vec<Felt> as CairoSerde>::cairo_serialize(&value.signature),
                ]
                .concat(),
            },
        }
    }
}

impl From<AbigenCall> for Call {
    fn from(
        AbigenCall {
            to,
            selector,
            calldata,
        }: AbigenCall,
    ) -> Call {
        Call {
            to: to.into(),
            selector,
            calldata,
        }
    }
}

impl From<Call> for AbigenCall {
    fn from(call: Call) -> AbigenCall {
        AbigenCall {
            to: call.to.into(),
            selector: call.selector,
            calldata: call.calldata,
        }
    }
}

#[derive(Clone, Debug)]
pub enum OutsideExecutionCaller {
    Any,
    Specific(ContractAddress),
}

impl OutsideExecutionCaller {
    pub fn into_contract_address(self) -> ContractAddress {
        match self {
            OutsideExecutionCaller::Any => ContractAddress(short_string!("ANY_CALLER")),
            OutsideExecutionCaller::Specific(address) => address,
        }
    }
}

impl From<OutsideExecutionCaller> for ContractAddress {
    fn from(caller: OutsideExecutionCaller) -> Self {
        caller.into_contract_address()
    }
}

impl Serialize for OutsideExecutionCaller {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let contract_address: ContractAddress = self.clone().into();
        ContractAddress::serialize(&contract_address, serializer)
    }
}

impl<'de> Deserialize<'de> for OutsideExecutionCaller {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let contract_address = ContractAddress::deserialize(deserializer)?;
        if contract_address == ContractAddress(short_string!("ANY_CALLER")) {
            Ok(OutsideExecutionCaller::Any)
        } else {
            Ok(OutsideExecutionCaller::Specific(contract_address))
        }
    }
}
