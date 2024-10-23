use cainome::cairo_serde_derive::CairoSerde;
use serde::{Deserialize, Serialize};
use starknet::core::types::Felt;
use starknet::macros::{selector, short_string};
use starknet_crypto::poseidon_hash_many;

use crate::abigen;
use crate::hash::MessageHashRev1;
use crate::hash::{StarknetDomain, StructHashRev1};

#[derive(Clone, CairoSerde, Serialize, Deserialize, PartialEq, Debug)]
pub struct OutsideExecutionV2 {
    pub caller: cainome::cairo_serde::ContractAddress,
    pub nonce: starknet::core::types::Felt,
    #[serde(
        serialize_with = "cainome::cairo_serde::serialize_as_hex",
        deserialize_with = "cainome::cairo_serde::deserialize_from_hex"
    )]
    pub execute_after: u64,
    #[serde(
        serialize_with = "cainome::cairo_serde::serialize_as_hex",
        deserialize_with = "cainome::cairo_serde::deserialize_from_hex"
    )]
    pub execute_before: u64,
    pub calls: Vec<abigen::controller::Call>,
}

impl StructHashRev1 for OutsideExecutionV2 {
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

impl MessageHashRev1 for OutsideExecutionV2 {
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

#[cfg(test)]
mod tests {
    use crate::{abigen::controller::Call, account::outside_execution::OutsideExecutionCaller};

    use super::*;
    use serde_json::json;
    use starknet::macros::felt;

    #[test]
    fn test_outside_execution_serialization() {
        let outside_execution = OutsideExecutionV2 {
            caller: OutsideExecutionCaller::Any.into(),
            execute_after: 0,
            execute_before: 3000000000,
            calls: vec![
                Call {
                    to: felt!("0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7")
                        .into(),
                    selector: selector!("approve"),
                    calldata: vec![
                        felt!("0x50302d9f4df7a96567423f64f1271ef07537469d8e8c4dd2409cf3cc4274de4"),
                        felt!("0x11c37937e08000"),
                        Felt::ZERO,
                    ],
                },
                Call {
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
            nonce: felt!("0x564b73282b2fb5f201cf2070bf0ca2526871cb7daa06e0e805521ef5d907b33"),
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
            "nonce": "0x564b73282b2fb5f201cf2070bf0ca2526871cb7daa06e0e805521ef5d907b33",
        });

        assert_eq!(serialized, expected);
    }
}
