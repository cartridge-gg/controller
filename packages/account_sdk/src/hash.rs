use starknet::macros::selector;
use starknet_crypto::{poseidon_hash_many, FieldElement};

use crate::abigen::cartridge_account::Call;

pub trait StructHashRev1 {
    const TYPE_HASH_REV_1: FieldElement;
    fn get_struct_hash_rev_1(&self) -> FieldElement;
}

pub trait MessageHashRev1 {
    fn get_message_hash_rev_1(
        &self,
        chain_id: FieldElement,
        contract_address: FieldElement,
    ) -> FieldElement;
}

impl StructHashRev1 for Call {
    fn get_struct_hash_rev_1(&self) -> FieldElement {
        poseidon_hash_many(&[
            Self::TYPE_HASH_REV_1,
            self.to.into(),
            self.selector,
            poseidon_hash_many(&self.calldata),
        ])
    }
    const TYPE_HASH_REV_1: FieldElement = selector!(
        "\"Call\"(\"To\":\"ContractAddress\",\"Selector\":\"selector\",\"Calldata\":\"felt*\")"
    );
}

#[derive(Clone, Debug, PartialEq)]
pub struct StarknetDomain {
    pub name: FieldElement,
    pub version: FieldElement,
    pub chain_id: FieldElement,
    pub revision: FieldElement,
}

impl StructHashRev1 for StarknetDomain {
    fn get_struct_hash_rev_1(&self) -> FieldElement {
        poseidon_hash_many(&[
            Self::TYPE_HASH_REV_1,
            self.name,
            self.version,
            self.chain_id,
            self.revision,
        ])
    }

    const TYPE_HASH_REV_1: FieldElement = selector!(
        "\"StarknetDomain\"(\"name\":\"shortstring\",\"version\":\"shortstring\",\"chainId\":\"shortstring\",\"revision\":\"shortstring\")"
    );
}
