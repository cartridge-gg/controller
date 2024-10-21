use crate::abigen::controller::{Call as AbigenCall, OutsideExecution};
use crate::{
    hash::{MessageHashRev1, StarknetDomain, StructHashRev1},
    signers::SignError,
};
use async_trait::async_trait;
use cainome::cairo_serde::{CairoSerde, ContractAddress};
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use starknet::accounts::Account;
use starknet::core::types::{Call, Felt};
use starknet::macros::{selector, short_string};
use starknet::signers::SigningKey;
use starknet_crypto::poseidon_hash_many;

use super::AccountHashAndCallsSigner;

#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
pub trait OutsideExecutionAccount {
    async fn sign_outside_execution(
        &self,
        outside_execution: OutsideExecution,
    ) -> Result<SignedOutsideExecution, SignError>;
    fn random_outside_execution_nonce(&self) -> (Felt, u128) {
        (SigningKey::from_random().secret_scalar(), 1)
    }
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
                &outside_execution
                    .calls
                    .iter()
                    .cloned()
                    .map(Call::from)
                    .collect::<Vec<_>>(),
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
        Call {
            to: value.contract_address,
            selector: selector!("execute_from_outside_v3"),
            calldata: [
                <OutsideExecution as CairoSerde>::cairo_serialize(&value.outside_execution),
                <Vec<Felt> as CairoSerde>::cairo_serialize(&value.signature),
            ]
            .concat(),
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

// pub type OutsideExecution = crate::abigen::controller::OutsideExecution;

impl StructHashRev1 for crate::abigen::controller::OutsideExecution {
    fn get_struct_hash_rev_1(&self) -> Felt {
        let hashed_calls = self
            .calls
            .iter()
            .map(StructHashRev1::get_struct_hash_rev_1)
            .collect::<Vec<_>>();
        poseidon_hash_many(&[
            Self::TYPE_HASH_REV_1,
            self.caller.into(),
            self.nonce.0,
            self.nonce.1.into(),
            self.execute_after.into(),
            self.execute_before.into(),
            poseidon_hash_many(&hashed_calls),
        ])
    }

    const TYPE_HASH_REV_1: Felt = selector!(
        "\"OutsideExecution\"(\"Caller\":\"ContractAddress\",\"Nonce\":\"(felt,u128)\",\"Execute After\":\"u128\",\"Execute Before\":\"u128\",\"Calls\":\"Call*\")\"Call\"(\"To\":\"ContractAddress\",\"Selector\":\"selector\",\"Calldata\":\"felt*\")"
    );
}

impl MessageHashRev1 for OutsideExecution {
    fn get_message_hash_rev_1(&self, chain_id: Felt, contract_address: Felt) -> Felt {
        // Version and Revision should be shortstring '1' and not felt 1 for SNIP-9 due to a mistake
        // in the Braavos contracts and has been copied for compatibility.
        // Revision will also be a number for all SNIP12-rev1 signatures because of the same issue
        let domain = StarknetDomain {
            name: short_string!("Account.execute_from_outside"),
            version: Felt::TWO,
            chain_id,
            revision: Felt::TWO,
        };
        poseidon_hash_many(&[
            short_string!("StarkNet Message"),
            domain.get_struct_hash_rev_1(),
            contract_address,
            self.get_struct_hash_rev_1(),
        ])
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use starknet::macros::felt;

    #[test]
    fn test_outside_execution_serialization() {
        let outside_execution = OutsideExecution {
            caller: OutsideExecutionCaller::Any.into(),
            execute_after: 0,
            execute_before: 3000000000,
            calls: vec![
                AbigenCall {
                    to: felt!("0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7")
                        .into(),
                    selector: selector!("approve"),
                    calldata: vec![
                        felt!("0x50302d9f4df7a96567423f64f1271ef07537469d8e8c4dd2409cf3cc4274de4"),
                        felt!("0x11c37937e08000"),
                        Felt::ZERO,
                    ],
                },
                AbigenCall {
                    to: felt!("0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7")
                        .into(),
                    selector: selector!("transfer"),
                    calldata: vec![
                        felt!("0x50302d9f4df7a96567423f64f1271ef07537469d8e8c4dd2409cf3cc4274de4"),
                        felt!("0x11c37937e08000"),
                        Felt::ZERO,
                    ],
                },
            ],
            nonce: (
                felt!("0x564b73282b2fb5f201cf2070bf0ca2526871cb7daa06e0e805521ef5d907b33"),
                0,
            ),
        };

        let serialized = serde_json::to_value(outside_execution).unwrap();

        let expected = json!({
            "caller": "0x414e595f43414c4c4552",
            "execute_after": "0x0",
            "execute_before": "0xb2d05e00",
            "calls": [
                {
                    "to": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                    "selector": "0x219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c",
                    "calldata": [
                        "0x50302d9f4df7a96567423f64f1271ef07537469d8e8c4dd2409cf3cc4274de4",
                        "0x11c37937e08000",
                        "0x0"
                    ]
                },
                {
                    "to": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                    "selector": "0x83afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e",
                    "calldata": [
                        "0x50302d9f4df7a96567423f64f1271ef07537469d8e8c4dd2409cf3cc4274de4",
                        "0x11c37937e08000",
                        "0x0"
                    ]
                }
            ],
            "nonce": ["0x564b73282b2fb5f201cf2070bf0ca2526871cb7daa06e0e805521ef5d907b33", "0x0"],
        });

        assert_eq!(serialized, expected);
    }
}
