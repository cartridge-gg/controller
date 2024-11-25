use starknet::{core::types::Felt, macros::selector};
use starknet_crypto::poseidon_hash_many;

use crate::hash::StructHashRev1;

use super::AccountHashAndCallsSigner;

pub mod account;
pub mod hash;
pub mod merkle;
pub mod policy;

pub type TypedData = crate::abigen::controller::TypedData;

impl StructHashRev1 for TypedData {
    const TYPE_HASH_REV_1: Felt =
        selector!("\"Allowed Type\"(\"Scope Hash\":\"felt\",\"Typed Data Hash\":\"felt\")");

    fn get_struct_hash_rev_1(&self) -> Felt {
        poseidon_hash_many([
            &Self::TYPE_HASH_REV_1,
            &self.scope_hash,
            &self.typed_data_hash,
        ])
    }
}
