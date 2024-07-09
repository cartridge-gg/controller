use starknet::core::types::Felt;
use starknet_crypto::poseidon_hash;

pub struct MerkleTree;

impl MerkleTree {
    pub fn compute_root(mut current_node: Felt, mut proof: Vec<Felt>) -> Felt {
        loop {
            if proof.is_empty() {
                break current_node;
            }

            let proof_element = proof.remove(0);
            // Compute the hash of the current node and the current element of the proof.
            // We need to check if the current node is smaller than the current element of the proof.
            // If it is, we need to swap the order of the hash.
            current_node = if current_node < proof_element {
                poseidon_hash(current_node, proof_element)
            } else {
                poseidon_hash(proof_element, current_node)
            };
        }
    }
    pub fn compute_proof(leaves: Vec<Felt>, index: usize) -> Vec<Felt> {
        let mut proof = vec![];
        compute_proof(leaves, index, &mut proof);
        proof
    }
}

// based on: https://github.com/keep-starknet-strange/alexandria/blob/ecc881e2aee668332441bdfa32336e3404cf8eb1/src/merkle_tree/src/merkle_tree.cairo#L182C4-L215
fn compute_proof(mut nodes: Vec<Felt>, index: usize, proof: &mut Vec<Felt>) {
    // Break if we have reached the top of the tree
    if nodes.len() == 1 {
        return;
    }

    // If odd number of nodes, add a null virtual leaf
    if nodes.len() % 2 != 0 {
        nodes.push(Felt::ZERO);
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

fn get_next_level(nodes: &[Felt]) -> Vec<Felt> {
    let mut next_level: Vec<Felt> = Vec::with_capacity(nodes.len() / 2);
    for i in 0..nodes.len() / 2 {
        let left = nodes[i * 2];
        let right = nodes[i * 2 + 1];

        let node = if left < right {
            poseidon_hash(left, right)
        } else {
            poseidon_hash(right, left)
        };
        next_level.push(node);
    }
    next_level
}

// Example from https://github.com/keep-starknet-strange/alexandria/blob/ecc881e2aee668332441bdfa32336e3404cf8eb1/src/merkle_tree/src/tests/merkle_tree_test.cairo#L104-L151
#[test]
fn merkle_tree_poseidon_test() {
    use starknet::macros::felt;
    // [Setup] Merkle tree.
    let root = felt!("0x48924a3b2a7a7b7cc1c9371357e95e322899880a6534bdfe24e96a828b9d780");
    let leaf = felt!("0x1");
    let valid_proof = vec![
        felt!("0x2"),
        felt!("0x338eb608d7e48306d01f5a8d4275dd85a52ba79aaf7a1a7b35808ba573c3669"),
    ];
    let leaves = vec![felt!("0x1"), felt!("0x2"), felt!("0x3")];

    // [Assert] Compute merkle root.
    let computed_root = MerkleTree::compute_root(leaf, valid_proof.clone());
    assert_eq!(computed_root, root, "compute valid root failed");

    // [Assert] Compute merkle proof.
    let input_leaves = leaves;
    let index = 0;
    let mut computed_proof = vec![];
    compute_proof(input_leaves, index, &mut computed_proof);
    assert_eq!(computed_proof, valid_proof, "compute valid proof failed");
}
