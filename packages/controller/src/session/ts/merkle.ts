import { hash } from "starknet";
import type {
  Policy,
  CallPolicy,
  TypedDataPolicy,
  ApprovalPolicy,
} from "./types";
import { normalizeFelt } from "./shared";

const ZERO_FELT = "0x0";

/**
 * SNIP-12 type hash for "Allowed Method"("Contract Address":"ContractAddress","selector":"selector")
 */
const POLICY_CALL_TYPE_HASH = normalizeFelt(
  hash.getSelectorFromName(
    '"Allowed Method"("Contract Address":"ContractAddress","selector":"selector")',
  ),
);

export interface PolicyMerkleResult {
  leaves: string[];
  root: string;
}

export interface PolicyMerkleProof {
  contractAddress: string;
  selector: string;
  leaf: string;
  proof: string[];
}

function isCallPolicy(p: Policy): p is CallPolicy {
  return "method" in p && "target" in p && !("spender" in p);
}

function isApprovalPolicy(p: Policy): p is ApprovalPolicy {
  return "spender" in p && "amount" in p && "target" in p;
}

function isTypedDataPolicy(p: Policy): p is TypedDataPolicy {
  return "scope_hash" in p;
}

/**
 * Canonical pair hashing: always hash (smaller, larger) for deterministic trees.
 */
export function hashPair(a: string, b: string): string {
  const aBig = BigInt(a);
  const bBig = BigInt(b);
  const [left, right] = aBig <= bBig ? [a, b] : [b, a];
  return normalizeFelt(hash.computePoseidonHash(left, right));
}

/**
 * Hash a single policy into a merkle leaf.
 */
export function hashPolicyLeaf(policy: Policy): string {
  if (isCallPolicy(policy)) {
    return normalizeFelt(
      hash.computePoseidonHashOnElements([
        POLICY_CALL_TYPE_HASH,
        normalizeFelt(policy.target),
        normalizeFelt(policy.method),
      ]),
    );
  }

  if (isApprovalPolicy(policy)) {
    // Approval policies use: Poseidon(typeHash, target, spender, amount)
    return normalizeFelt(
      hash.computePoseidonHashOnElements([
        POLICY_CALL_TYPE_HASH,
        normalizeFelt(policy.target),
        normalizeFelt(policy.spender),
        normalizeFelt(policy.amount),
      ]),
    );
  }

  if (isTypedDataPolicy(policy)) {
    return normalizeFelt(
      hash.computePoseidonHashOnElements([
        POLICY_CALL_TYPE_HASH,
        normalizeFelt(policy.scope_hash),
      ]),
    );
  }

  throw new Error("Unknown policy type");
}

/**
 * Build a merkle tree from policies and return the leaves and root.
 */
export function computePolicyMerkle(policies: Policy[]): PolicyMerkleResult {
  if (policies.length === 0) {
    return { leaves: [], root: ZERO_FELT };
  }

  const leaves = policies.map(hashPolicyLeaf);
  let level = [...leaves];

  while (level.length > 1) {
    if (level.length % 2 !== 0) {
      level.push(ZERO_FELT);
    }
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(hashPair(level[i], level[i + 1]));
    }
    level = next;
  }

  return { leaves, root: level[0] };
}

/**
 * Generate merkle proofs for each policy.
 */
export function computePolicyMerkleProofs(
  policies: Policy[],
): PolicyMerkleProof[] {
  if (policies.length === 0) {
    return [];
  }

  const leaves = policies.map(hashPolicyLeaf);
  const proofs: string[][] = leaves.map(() => []);

  // Track which original leaf indices are at each position in the current level
  let positionToLeaves: number[][] = leaves.map((_, i) => [i]);
  let level = [...leaves];

  while (level.length > 1) {
    if (level.length % 2 !== 0) {
      level.push(ZERO_FELT);
      positionToLeaves.push([]);
    }

    const nextLevel: string[] = [];
    const nextPositionToLeaves: number[][] = [];

    for (let i = 0; i < level.length; i += 2) {
      const parent = hashPair(level[i], level[i + 1]);
      nextLevel.push(parent);

      // For each original leaf at position i, its sibling is level[i+1]
      for (const leafIdx of positionToLeaves[i]) {
        proofs[leafIdx].push(level[i + 1]);
      }
      // For each original leaf at position i+1, its sibling is level[i]
      for (const leafIdx of positionToLeaves[i + 1]) {
        proofs[leafIdx].push(level[i]);
      }

      // Merge both positions' leaf sets into the parent position
      nextPositionToLeaves.push([
        ...positionToLeaves[i],
        ...positionToLeaves[i + 1],
      ]);
    }

    level = nextLevel;
    positionToLeaves = nextPositionToLeaves;
  }

  return policies.map((policy, i) => {
    const target =
      isCallPolicy(policy) || isApprovalPolicy(policy)
        ? normalizeFelt(policy.target)
        : ZERO_FELT;
    const selector = isCallPolicy(policy)
      ? normalizeFelt(policy.method)
      : ZERO_FELT;

    return {
      contractAddress: target,
      selector,
      leaf: leaves[i],
      proof: proofs[i],
    };
  });
}
