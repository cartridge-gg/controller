use serde::{Deserialize, Serialize};
use starknet::core::types::Call;
use starknet::core::types::Felt;
use starknet::macros::selector;
use starknet_crypto::poseidon_hash_many;

use super::TypedData;
use crate::hash::StructHashRev1;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ProvedPolicy {
    pub policy: Policy,
    pub proof: Vec<Felt>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum Policy {
    Call(CallPolicy),
    TypedData(TypedDataPolicy),
}

impl Policy {
    pub fn new_call(contract_address: Felt, selector: Felt) -> Self {
        Policy::Call(CallPolicy {
            contract_address,
            selector,
            authorized: Some(true),
        })
    }

    pub fn new_typed_data(scope_hash: Felt) -> Self {
        Policy::TypedData(TypedDataPolicy {
            scope_hash,
            authorized: Some(true),
        })
    }

    pub fn is_authorized(&self) -> bool {
        match self {
            Policy::Call(call) => call.authorized.unwrap_or(false),
            Policy::TypedData(typed_data) => typed_data.authorized.unwrap_or(false),
        }
    }
}

impl PartialEq for CallPolicy {
    fn eq(&self, other: &Self) -> bool {
        self.contract_address == other.contract_address && self.selector == other.selector
    }
}

impl PartialEq for TypedDataPolicy {
    fn eq(&self, other: &Self) -> bool {
        self.scope_hash == other.scope_hash
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CallPolicy {
    pub contract_address: Felt,
    pub selector: Felt,
    pub authorized: Option<bool>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TypedDataPolicy {
    pub scope_hash: Felt,
    pub authorized: Option<bool>,
}

impl From<&Call> for Policy {
    fn from(call: &Call) -> Self {
        Policy::Call(CallPolicy {
            contract_address: call.to,
            selector: call.selector,
            authorized: Some(true),
        })
    }
}

impl From<&TypedData> for Policy {
    fn from(typed_data: &TypedData) -> Self {
        Self::TypedData(TypedDataPolicy {
            scope_hash: typed_data.scope_hash,
            authorized: Some(true),
        })
    }
}

impl Policy {
    pub fn from_calls(calls: &[Call]) -> Vec<Self> {
        calls.iter().map(Self::from).collect()
    }
}

impl StructHashRev1 for CallPolicy {
    fn get_struct_hash_rev_1(&self) -> Felt {
        poseidon_hash_many(&[Self::TYPE_HASH_REV_1, self.contract_address, self.selector])
    }

    const TYPE_HASH_REV_1: Felt = selector!(
        "\"Allowed Method\"(\"Contract Address\":\"ContractAddress\",\"selector\":\"selector\")"
    );
}

impl StructHashRev1 for TypedDataPolicy {
    fn get_struct_hash_rev_1(&self) -> Felt {
        poseidon_hash_many(&[Self::TYPE_HASH_REV_1, self.scope_hash])
    }

    const TYPE_HASH_REV_1: Felt = selector!("\"Allowed Type\"(\"Scope Hash\":\"felt\")");
}

pub trait MerkleLeaf {
    fn as_merkle_leaf(&self) -> Felt;
}

impl MerkleLeaf for Policy {
    fn as_merkle_leaf(&self) -> Felt {
        match self {
            Policy::Call(call_policy) if call_policy.authorized.unwrap_or(false) => {
                call_policy.as_merkle_leaf()
            }
            Policy::TypedData(typed_data_policy)
                if typed_data_policy.authorized.unwrap_or(false) =>
            {
                typed_data_policy.as_merkle_leaf()
            }
            _ => Felt::ZERO,
        }
    }
}

impl MerkleLeaf for CallPolicy {
    fn as_merkle_leaf(&self) -> Felt {
        poseidon_hash_many(&[Self::TYPE_HASH_REV_1, self.contract_address, self.selector])
    }
}

impl MerkleLeaf for TypedDataPolicy {
    fn as_merkle_leaf(&self) -> Felt {
        poseidon_hash_many(&[Self::TYPE_HASH_REV_1, self.scope_hash])
    }
}
