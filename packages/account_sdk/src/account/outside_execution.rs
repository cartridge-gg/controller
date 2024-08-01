use crate::abigen::controller::Call as AbigenCall;
use crate::{
    hash::{MessageHashRev1, StarknetDomain, StructHashRev1},
    signers::SignError,
};
use async_trait::async_trait;
use cainome::cairo_serde::{CairoSerde, ContractAddress};
use serde::{Deserialize, Serialize};
use starknet::core::types::Felt;
use starknet::signers::SigningKey;
use starknet::{
    accounts::Call,
    macros::{selector, short_string},
};
use starknet_crypto::poseidon_hash_many;

use super::{AccountHashAndCallsSigner, SpecificAccount};

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait OutsideExecutionAccount {
    async fn sign_outside_execution(
        &self,
        outside_execution: OutsideExecution,
    ) -> Result<SignedOutsideExecution, SignError>;
    fn random_outside_execution_nonce(&self) -> Felt {
        SigningKey::from_random().secret_scalar()
    }
}

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
impl<T> OutsideExecutionAccount for T
where
    T: AccountHashAndCallsSigner + Sync + SpecificAccount,
{
    async fn sign_outside_execution(
        &self,
        outside_execution: OutsideExecution,
    ) -> Result<SignedOutsideExecution, SignError> {
        let raw: OutsideExecutionRaw = outside_execution.into();
        let signature = self
            .sign_hash_and_calls(
                raw.get_message_hash_rev_1(self.chain_id(), self.address()),
                &raw.calls
                    .iter()
                    .cloned()
                    .map(Call::from)
                    .collect::<Vec<_>>(),
            )
            .await?;
        Ok(SignedOutsideExecution {
            outside_execution: raw,
            signature,
            contract_address: self.address(),
        })
    }
}

#[derive(Clone, Debug)]
pub struct SignedOutsideExecution {
    pub outside_execution: OutsideExecutionRaw,
    pub signature: Vec<Felt>,
    pub contract_address: Felt,
}

impl From<SignedOutsideExecution> for Call {
    fn from(value: SignedOutsideExecution) -> Self {
        Call {
            to: value.contract_address,
            selector: selector!("execute_from_outside_v2"),
            calldata: [
                <OutsideExecutionRaw as CairoSerde>::cairo_serialize(&value.outside_execution),
                <Vec<Felt> as CairoSerde>::cairo_serialize(&value.signature),
            ]
            .concat(),
        }
    }
}

mod call_serde {
    use serde::{Deserialize, Deserializer, Serialize, Serializer};
    use starknet::accounts::Call;
    use starknet_crypto::Felt;

    pub fn serialize<S>(calls: &[Call], serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // Serialize each Call as a tuple
        calls
            .iter()
            .map(|call| (&call.to, &call.selector, &call.calldata))
            .collect::<Vec<_>>()
            .serialize(serializer)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Vec<Call>, D::Error>
    where
        D: Deserializer<'de>,
    {
        // Deserialize into a Vec of tuples, then convert to Vec<Call>
        let tuples: Vec<(Felt, Felt, Vec<Felt>)> = Vec::deserialize(deserializer)?;
        Ok(tuples
            .into_iter()
            .map(|(to, selector, calldata)| Call {
                to,
                selector,
                calldata,
            })
            .collect())
    }
}

mod caller_serde {
    use serde::{Deserialize, Deserializer, Serializer};
    use starknet_crypto::Felt;
    use super::OutsideExecutionCaller;

    pub fn serialize<S>(caller: &OutsideExecutionCaller, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match caller {
            OutsideExecutionCaller::Any => serializer.serialize_str("ANY_CALLER"),
            OutsideExecutionCaller::Specific(address) => {
                let hex = format!("0x{:064x}", address.0);
                serializer.serialize_str(&hex)
            }
        }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<OutsideExecutionCaller, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        if s == "ANY_CALLER" {
            Ok(OutsideExecutionCaller::Any)
        } else {
            Felt::from_hex(&s)
                .map(|address| OutsideExecutionCaller::Specific(address.into()))
                .map_err(serde::de::Error::custom)
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct OutsideExecution {
    #[serde(with = "caller_serde")]
    pub caller: OutsideExecutionCaller,
    pub execute_after: u64,
    pub execute_before: u64,
    #[serde(with = "call_serde")]
    pub calls: Vec<Call>,
    pub nonce: Felt,
}

impl From<OutsideExecution> for OutsideExecutionRaw {
    fn from(value: OutsideExecution) -> OutsideExecutionRaw {
        OutsideExecutionRaw {
            caller: value.caller.into(),
            execute_after: value.execute_after,
            execute_before: value.execute_before,
            calls: value.calls.into_iter().map(AbigenCall::from).collect(),
            nonce: value.nonce,
        }
    }
}

impl From<Call> for AbigenCall {
    fn from(
        Call {
            to,
            selector,
            calldata,
        }: Call,
    ) -> AbigenCall {
        AbigenCall {
            to: ContractAddress::from(to),
            selector,
            calldata,
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

#[derive(Clone, Debug, Deserialize, Serialize)]
pub enum OutsideExecutionCaller {
    Any,
    Specific(ContractAddress),
}

impl From<OutsideExecutionCaller> for ContractAddress {
    fn from(caller: OutsideExecutionCaller) -> Self {
        match caller {
            OutsideExecutionCaller::Any => ContractAddress(short_string!("ANY_CALLER")),
            OutsideExecutionCaller::Specific(address) => address,
        }
    }
}

pub type OutsideExecutionRaw = crate::abigen::controller::OutsideExecution;

impl StructHashRev1 for OutsideExecutionRaw {
    fn get_struct_hash_rev_1(&self) -> Felt {
        let hashed_calls = self
            .calls
            .iter()
            .map(StructHashRev1::get_struct_hash_rev_1)
            .collect::<Vec<_>>();
        poseidon_hash_many(&[
            Self::TYPE_HASH_REV_1,
            self.caller.into(),
            self.nonce,
            self.execute_after.into(),
            self.execute_before.into(),
            poseidon_hash_many(&hashed_calls),
        ])
    }

    const TYPE_HASH_REV_1: Felt = selector!(
        "\"OutsideExecution\"(\"Caller\":\"ContractAddress\",\"Nonce\":\"felt\",\"Execute After\":\"u128\",\"Execute Before\":\"u128\",\"Calls\":\"Call*\")\"Call\"(\"To\":\"ContractAddress\",\"Selector\":\"selector\",\"Calldata\":\"felt*\")"
    );
}

impl MessageHashRev1 for OutsideExecutionRaw {
    fn get_message_hash_rev_1(&self, chain_id: Felt, contract_address: Felt) -> Felt {
        // Version and Revision should be shortstring '1' and not felt 1 for SNIP-9 due to a mistake
        // in the Braavos contracts and has been copied for compatibility.
        // Revision will also be a number for all SNIP12-rev1 signatures because of the same issue
        let domain = StarknetDomain {
            name: short_string!("Account.execute_from_outside"),
            version: Felt::TWO,
            chain_id,
            revision: Felt::ONE,
        };
        poseidon_hash_many(&[
            short_string!("StarkNet Message"),
            domain.get_struct_hash_rev_1(),
            contract_address,
            self.get_struct_hash_rev_1(),
        ])
    }
}
