use serde::{Deserialize, Serialize};
use serde_json::json;
use starknet::core::utils::{get_selector_from_name, NonAsciiNameError};
use starknet::macros::selector;
use starknet_crypto::{poseidon_hash_many, poseidon_permute_comp, FieldElement};

use crate::abigen::controller::Signer;

use crate::hash::MessageHashRev1;
use crate::signers::{SignError, SignerTrait};

use super::merkle::MerkleTree;
use super::raw_session::RawSession;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ProvedMethod {
    pub(crate) method: AllowedMethod,
    pub(crate) proof: Vec<FieldElement>,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Session {
    expires_at: u64,
    allowed_methods: Vec<ProvedMethod>,
    allowed_methods_root: FieldElement,
    metadata: String,
    session_key_guid: FieldElement,
}

impl Session {
    pub fn new(
        allowed_methods: Vec<AllowedMethod>,
        expires_at: u64,
        signer: &Signer,
    ) -> Result<Self, SignError> {
        if allowed_methods.is_empty() {
            return Err(SignError::NoAllowedSessionMethods);
        }
        let metadata = json!({ "metadata": "metadata", "max_fee": 0 });
        let hashes = allowed_methods
            .iter()
            .map(AllowedMethod::as_merkle_leaf)
            .collect::<Vec<FieldElement>>();
        let allowed_methods: Vec<_> = allowed_methods
            .into_iter()
            .enumerate()
            .map(|(i, method)| ProvedMethod {
                method,
                proof: MerkleTree::compute_proof(hashes.clone(), i),
            })
            .collect();
        let root = MerkleTree::compute_root(hashes[0], allowed_methods[0].proof.clone());
        Ok(Self {
            expires_at,
            allowed_methods,
            allowed_methods_root: root,
            metadata: serde_json::to_string(&metadata).unwrap(),
            session_key_guid: signer.guid(),
        })
    }
    fn allowed_method_hash_rev_1() -> FieldElement {
        selector!("\"Allowed Method\"(\"Contract Address\":\"ContractAddress\",\"selector\":\"selector\")")
    }
    pub fn raw(&self) -> RawSession {
        RawSession {
            expires_at: self.expires_at,
            allowed_methods_root: self.allowed_methods_root,
            metadata_hash: FieldElement::ZERO,
            session_key_guid: self.session_key_guid,
        }
    }
    pub fn message_hash(
        &self,
        tx_hash: FieldElement,
        chain_id: FieldElement,
        address: FieldElement,
    ) -> Result<FieldElement, NonAsciiNameError> {
        let token_session_hash = self.raw().get_message_hash_rev_1(chain_id, address);
        let mut msg_hash = [tx_hash, token_session_hash, FieldElement::TWO];
        poseidon_permute_comp(&mut msg_hash);
        Ok(msg_hash[0])
    }
    pub fn single_proof(&self, call: &AllowedMethod) -> Option<Vec<FieldElement>> {
        self.allowed_methods
            .iter()
            .find(|ProvedMethod { method, .. }| method == call)
            .map(|ProvedMethod { proof, .. }| proof.clone())
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AllowedMethod {
    pub contract_address: FieldElement,
    pub selector: FieldElement,
}

impl AllowedMethod {
    pub fn new(
        contract_address: FieldElement,
        name: &str,
    ) -> Result<AllowedMethod, NonAsciiNameError> {
        Ok(Self::with_selector(
            contract_address,
            get_selector_from_name(name)?,
        ))
    }
    pub fn with_selector(contract_address: FieldElement, selector: FieldElement) -> AllowedMethod {
        Self {
            contract_address,
            selector,
        }
    }
}

impl AllowedMethod {
    pub fn as_merkle_leaf(&self) -> FieldElement {
        poseidon_hash_many(&[
            Session::allowed_method_hash_rev_1(),
            self.contract_address,
            self.selector,
        ])
    }
}
