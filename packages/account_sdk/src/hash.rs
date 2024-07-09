use starknet::core::types::Felt;
use starknet::macros::selector;
use starknet_crypto::poseidon_hash_many;

use crate::abigen::controller::Call;

pub trait StructHashRev1 {
    const TYPE_HASH_REV_1: Felt;
    fn get_struct_hash_rev_1(&self) -> Felt;
}

pub trait MessageHashRev1 {
    fn get_message_hash_rev_1(&self, chain_id: Felt, contract_address: Felt) -> Felt;
}

impl StructHashRev1 for Call {
    fn get_struct_hash_rev_1(&self) -> Felt {
        poseidon_hash_many(&[
            Self::TYPE_HASH_REV_1,
            self.to.into(),
            self.selector,
            poseidon_hash_many(&self.calldata),
        ])
    }
    const TYPE_HASH_REV_1: Felt = selector!(
        "\"Call\"(\"To\":\"ContractAddress\",\"Selector\":\"selector\",\"Calldata\":\"felt*\")"
    );
}

#[derive(Clone, Debug, PartialEq)]
pub struct StarknetDomain {
    pub name: Felt,
    pub version: Felt,
    pub chain_id: Felt,
    pub revision: Felt,
}

impl StructHashRev1 for StarknetDomain {
    fn get_struct_hash_rev_1(&self) -> Felt {
        poseidon_hash_many(&[
            Self::TYPE_HASH_REV_1,
            self.name,
            self.version,
            self.chain_id,
            self.revision,
        ])
    }

    const TYPE_HASH_REV_1: Felt = selector!(
        "\"StarknetDomain\"(\"name\":\"shortstring\",\"version\":\"shortstring\",\"chainId\":\"shortstring\",\"revision\":\"shortstring\")"
    );
}
