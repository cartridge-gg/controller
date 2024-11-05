use cainome_cairo_serde::NonZero;
use serde::{Deserialize, Serialize};
use serde_json::json;
use starknet::core::types::Felt;
use starknet::core::utils::NonAsciiNameError;
use starknet::macros::selector;
use starknet::macros::short_string;
use starknet::signers::VerifyingKey;
use starknet_crypto::poseidon_hash_many;
use starknet_types_core::hash::Poseidon;

use crate::abigen;
use crate::abigen::controller::Signer;
use crate::abigen::controller::StarknetSigner;
use crate::hash::MessageHashRev1;
use crate::hash::StarknetDomain;
use crate::hash::StructHashRev1;
use crate::signers::SignError;
use crate::utils::time::get_current_timestamp;

use super::merkle::MerkleTree;
use super::policy::MerkleLeaf;
use super::policy::Policy;
use super::policy::ProvedPolicy;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Session {
    pub inner: crate::abigen::controller::Session,
    pub policies: Vec<ProvedPolicy>,
    pub metadata: String,
}

impl Session {
    pub fn new(
        policies: Vec<Policy>,
        expires_at: u64,
        session_signer: &Signer,
        guardian_guid: Felt,
    ) -> Result<Self, SignError> {
        if policies.is_empty() {
            return Err(SignError::NoAllowedSessionMethods);
        }
        let metadata = json!({ "metadata": "metadata", "max_fee": 0 });
        let hashes = policies
            .iter()
            .map(Policy::as_merkle_leaf)
            .collect::<Vec<Felt>>();
        let policies: Vec<_> = policies
            .into_iter()
            .enumerate()
            .map(|(i, method)| ProvedPolicy {
                policy: method,
                proof: MerkleTree::compute_proof(hashes.clone(), i),
            })
            .collect();
        let root = MerkleTree::compute_root(hashes[0], policies[0].proof.clone());
        Ok(Self {
            inner: crate::abigen::controller::Session {
                expires_at,
                allowed_policies_root: root,
                session_key_guid: session_signer.clone().into(),
                guardian_key_guid: guardian_guid,
                metadata_hash: Felt::ZERO,
            },
            policies,
            metadata: serde_json::to_string(&metadata).unwrap(),
        })
    }

    pub fn message_hash(
        &self,
        tx_hash: Felt,
        chain_id: Felt,
        address: Felt,
    ) -> Result<Felt, NonAsciiNameError> {
        self.inner.hash(chain_id, address, tx_hash)
    }

    pub fn single_proof(&self, policy: &Policy) -> Option<Vec<Felt>> {
        self.policies
            .iter()
            .find(|ProvedPolicy { policy: method, .. }| method == policy)
            .map(|ProvedPolicy { proof, .. }| proof.clone())
    }

    pub fn is_authorized(&self, policy: &Policy) -> bool {
        self.policies
            .iter()
            .any(|proved_policy| proved_policy.policy == *policy)
    }

    pub fn is_expired(&self) -> bool {
        let current_timestamp = get_current_timestamp();
        self.inner.expires_at <= current_timestamp
    }

    pub fn is_session_key(&self, public_key: Felt) -> bool {
        let pubkey = VerifyingKey::from_scalar(public_key);
        let session_key_guid = Signer::Starknet(StarknetSigner {
            pubkey: NonZero::new(pubkey.scalar()).unwrap(),
        })
        .into();

        self.inner.session_key_guid == session_key_guid
    }
}

impl StructHashRev1 for abigen::controller::Session {
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

impl MessageHashRev1 for abigen::controller::Session {
    fn get_message_hash_rev_1(&self, chain_id: Felt, contract_address: Felt) -> Felt {
        let name = short_string!("SessionAccount.session");
        let domain = StarknetDomain {
            name,
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

impl SessionHash for abigen::controller::Session {
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

impl From<Session> for crate::abigen::controller::Session {
    fn from(session: Session) -> Self {
        session.inner
    }
}
