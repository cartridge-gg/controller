use starknet::core::types::Felt;
use starknet::core::utils::NonAsciiNameError;
use starknet::macros::{selector, short_string};
use starknet_crypto::poseidon_hash_many;
use starknet_types_core::hash::Poseidon;

use crate::hash::{MessageHashRev1, StarknetDomain, StructHashRev1};

pub type RawSession = crate::abigen::controller::Session;

impl StructHashRev1 for RawSession {
    fn get_struct_hash_rev_1(&self) -> Felt {
        poseidon_hash_many(&[
            Self::TYPE_HASH_REV_1,
            self.expires_at.into(),
            self.allowed_policies_root,
            self.metadata_hash,
            self.session_key_guid,
            self.guardian_key_guid,
        ])
    }

    const TYPE_HASH_REV_1: Felt = selector!(
        "\"Session\"(\"Expires At\":\"timestamp\",\"Allowed Methods\":\"merkletree\",\"Metadata\":\"string\",\"Session Key\":\"felt\")"
    );
}

impl MessageHashRev1 for RawSession {
    fn get_message_hash_rev_1(&self, chain_id: Felt, contract_address: Felt) -> Felt {
        let domain = StarknetDomain {
            name: short_string!("SessionAccount.session"),
            version: short_string!("1"),
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

pub trait SessionHash {
    fn hash(&self, chain_id: Felt, address: Felt, tx_hash: Felt)
        -> Result<Felt, NonAsciiNameError>;
}

impl SessionHash for RawSession {
    fn hash(
        &self,
        chain_id: Felt,
        address: Felt,
        tx_hash: Felt,
    ) -> Result<Felt, NonAsciiNameError> {
        let token_session_hash = self.get_message_hash_rev_1(chain_id, address);
        let mut msg_hash = [tx_hash, token_session_hash, Felt::TWO];
        Poseidon::hades_permutation(&mut msg_hash);
        Ok(msg_hash[0])
    }
}

pub type RawSessionToken = crate::abigen::controller::SessionToken;
