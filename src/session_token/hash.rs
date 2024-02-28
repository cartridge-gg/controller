use starknet::{core::types::FieldElement, macros::felt};
use starknet_crypto::PoseidonHasher;

use crate::abigen::account::{Call, SessionSignature};

// needs to behave anologously to https://github.com/keep-starknet-strange/alexandria,
// which uses starknets hash, reimplemented here https://github.com/starkware-libs/cairo-lang/blob/12ca9e91bbdc8a423c63280949c7e34382792067/src/starkware/cairo/common/poseidon_hash.py#L46

// H('StarkNetDomain(chainId:felt)')
const STARKNET_DOMAIN_TYPE_HASH: FieldElement =
    felt!("0x13cda234a04d66db62c06b8e3ad5f91bd0c67286c2c7519a826cf49da6ba478");
// H('Session(key:felt,expires:felt,root:merkletree)')
const SESSION_TYPE_HASH: FieldElement =
    felt!("0x1aa0e1c56b45cf06a54534fa1707c54e520b842feb21d03b7deddb6f1e340c");
// H(Policy(contractAddress:felt,selector:selector))
const POLICY_TYPE_HASH: FieldElement =
    felt!("0x2f0026e78543f036f33e26a8f5891b88c58dc1e20cbbfaf0bb53274da6fa568");

const STARKNET_MESSAGE_FELT: FieldElement = felt!("0x537461726b4e6574204d657373616765");

fn hash_two_elements(a: FieldElement, b: FieldElement) -> FieldElement {
    let mut hasher = PoseidonHasher::new();
    hasher.update(a);
    hasher.update(b);
    hasher.finalize()
}

pub fn compute_session_hash(
    signature: SessionSignature,
    chain_id: FieldElement,
    account: FieldElement,
) -> FieldElement {
    let domain_hash = hash_domain(chain_id);
    let message_hash = hash_message(
        signature.session_key,
        signature.session_expires.into(),
        signature.root,
    );
    let mut hasher = PoseidonHasher::new();
    hasher.update(STARKNET_MESSAGE_FELT);
    hasher.update(domain_hash);
    hasher.update(account);
    hasher.update(message_hash);
    hasher.finalize()
}

pub fn compute_call_hash(call: &Call) -> FieldElement {
    let mut hasher = PoseidonHasher::new();
    hasher.update(POLICY_TYPE_HASH);
    hasher.update((call.to).into());
    hasher.update(call.selector);
    hasher.finalize()
}

fn hash_domain(chain_id: FieldElement) -> FieldElement {
    let mut hasher = PoseidonHasher::new();
    hasher.update(STARKNET_DOMAIN_TYPE_HASH);
    hasher.update(chain_id);
    hasher.finalize()
}

fn hash_message(
    session_key: FieldElement,
    session_expires: FieldElement,
    root: FieldElement,
) -> FieldElement {
    let mut hasher = PoseidonHasher::new();
    hasher.update(SESSION_TYPE_HASH);
    hasher.update(session_key);
    hasher.update(session_expires);
    hasher.update(root);
    hasher.finalize()
}

pub fn calculate_merkle_proof(call_hashes: &[FieldElement], index: usize) -> Vec<FieldElement> {
    let mut proof = vec![];
    compute_proof(call_hashes.to_owned(), index, &mut proof);
    proof
}

pub fn compute_root(mut current_node: FieldElement, mut proof: Vec<FieldElement>) -> FieldElement {
    loop {
        if proof.is_empty() {
            break current_node;
        }

        let proof_element = proof.remove(0);
        // Compute the hash of the current node and the current element of the proof.
        // We need to check if the current node is smaller than the current element of the proof.
        // If it is, we need to swap the order of the hash.
        current_node = if current_node < proof_element {
            hash_two_elements(current_node, proof_element)
        } else {
            hash_two_elements(proof_element, current_node)
        };
    }
}

// based on: https://github.com/keep-starknet-strange/alexandria/blob/ecc881e2aee668332441bdfa32336e3404cf8eb1/src/merkle_tree/src/merkle_tree.cairo#L182C4-L215
fn compute_proof(mut nodes: Vec<FieldElement>, index: usize, proof: &mut Vec<FieldElement>) {
    // Break if we have reached the top of the tree
    if nodes.len() == 1 {
        return;
    }

    // If odd number of nodes, add a null virtual leaf
    if nodes.len() % 2 != 0 {
        nodes.push(FieldElement::ZERO);
    }

    // Compute next level
    let next_level = get_next_level(&nodes);

    // Find neighbor node
    let index_parent = index / 2;
    if index % 2 == 0 {
        proof.push(nodes[index + 1]);
    } else {
        proof.push(nodes[index - 1]);
    }

    compute_proof(next_level, index_parent, proof)
}

fn get_next_level(nodes: &Vec<FieldElement>) -> Vec<FieldElement> {
    let mut next_level: Vec<FieldElement> = Vec::with_capacity(nodes.len() / 2);
    for i in 0..nodes.len() / 2 {
        let left = nodes[i * 2];
        let right = nodes[i * 2 + 1];

        let node = if left < right {
            hash_two_elements(left, right)
        } else {
            hash_two_elements(right, left)
        };
        next_level.push(node);
    }
    next_level
}

// Example from https://github.com/keep-starknet-strange/alexandria/blob/ecc881e2aee668332441bdfa32336e3404cf8eb1/src/merkle_tree/src/tests/merkle_tree_test.cairo#L104-L151
#[test]
fn merkle_tree_poseidon_test() {
    // [Setup] Merkle tree.
    let root = felt!("0x48924a3b2a7a7b7cc1c9371357e95e322899880a6534bdfe24e96a828b9d780");
    let leaf = felt!("0x1");
    let valid_proof = vec![
        felt!("0x2"),
        felt!("0x338eb608d7e48306d01f5a8d4275dd85a52ba79aaf7a1a7b35808ba573c3669"),
    ];
    let leaves = vec![felt!("0x1"), felt!("0x2"), felt!("0x3")];

    // [Assert] Compute merkle root.
    let computed_root = compute_root(leaf, valid_proof.clone());
    assert_eq!(computed_root, root, "compute valid root failed");

    // [Assert] Compute merkle proof.
    let input_leaves = leaves;
    let index = 0;
    let mut computed_proof = vec![];
    compute_proof(input_leaves, index, &mut computed_proof);
    assert_eq!(computed_proof, valid_proof, "compute valid proof failed");
}
