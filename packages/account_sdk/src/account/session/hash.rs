use serde::{Deserialize, Serialize};
use serde_json::json;
use starknet::core::types::Call;
use starknet::core::types::Felt;
use starknet::core::utils::NonAsciiNameError;
use starknet::macros::selector;
use starknet_crypto::poseidon_hash_many;

use crate::abigen::controller::Signer as AbigenSigner;
use crate::signers::SignError;

use super::merkle::MerkleTree;
use super::raw_session::RawSession;
use super::raw_session::SessionHash;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ProvedPolicy {
    pub policy: Policy,
    pub proof: Vec<Felt>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Default)]
pub struct Session {
    pub expires_at: u64,
    pub policies: Vec<ProvedPolicy>,
    pub authorization_root: Felt,
    pub metadata: String,
    pub session_key_guid: Felt,
    pub guardian_key_guid: Felt,
}

impl Session {
    pub fn new(
        policies: Vec<Policy>,
        expires_at: u64,
        session_signer: &AbigenSigner,
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
            expires_at,
            policies,
            authorization_root: root,
            metadata: serde_json::to_string(&metadata).unwrap(),
            session_key_guid: session_signer.clone().into(),
            guardian_key_guid: guardian_guid,
        })
    }

    fn allowed_method_hash_rev_1() -> Felt {
        selector!("\"Allowed Method\"(\"Contract Address\":\"ContractAddress\",\"selector\":\"selector\")")
    }

    pub fn raw(&self) -> RawSession {
        RawSession {
            expires_at: self.expires_at,
            allowed_methods_root: self.authorization_root,
            metadata_hash: Felt::ZERO,
            session_key_guid: self.session_key_guid,
            guardian_key_guid: self.guardian_key_guid,
        }
    }

    pub fn message_hash(
        &self,
        tx_hash: Felt,
        chain_id: Felt,
        address: Felt,
    ) -> Result<Felt, NonAsciiNameError> {
        self.raw().hash(chain_id, address, tx_hash)
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
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Policy {
    pub contract_address: Felt,
    pub selector: Felt,
}

impl From<&Call> for Policy {
    fn from(call: &Call) -> Self {
        Policy {
            contract_address: call.to,
            selector: call.selector,
        }
    }
}

impl Policy {
    pub fn new(contract_address: Felt, selector: Felt) -> Policy {
        Self {
            contract_address,
            selector,
        }
    }

    pub fn as_merkle_leaf(&self) -> Felt {
        poseidon_hash_many(&[
            Session::allowed_method_hash_rev_1(),
            self.contract_address,
            self.selector,
        ])
    }

    pub fn from_calls(calls: &[Call]) -> Vec<Self> {
        calls.iter().map(Policy::from).collect()
    }
}
