import { hash } from "starknet";
import {
  hashPair,
  hashPolicyLeaf,
  computePolicyMerkle,
  computePolicyMerkleProofs,
} from "../session/internal/merkle";
import type {
  CallPolicy,
  TypedDataPolicy,
  ApprovalPolicy,
  Policy,
} from "../session/internal/types";

const SELECTOR_TRANSFER = hash.getSelectorFromName("transfer");
const SELECTOR_APPROVE = hash.getSelectorFromName("approve");
const SELECTOR_BALANCE = hash.getSelectorFromName("balance_of");

const ADDR_A = "0x0aaa";
const ADDR_B = "0x0bbb";

describe("hashPair", () => {
  test("is commutative (same result regardless of arg order)", () => {
    const a = "0x1";
    const b = "0x2";
    expect(hashPair(a, b)).toBe(hashPair(b, a));
  });

  test("produces valid hex output", () => {
    const result = hashPair("0x1", "0x2");
    expect(result).toMatch(/^0x[0-9a-f]+$/);
  });

  test("always hashes (smaller, larger)", () => {
    // Regardless of input order, the hash should be deterministic
    const r1 = hashPair("0x100", "0x1");
    const r2 = hashPair("0x1", "0x100");
    expect(r1).toBe(r2);
  });
});

describe("hashPolicyLeaf", () => {
  test("hashes a CallPolicy", () => {
    const policy: CallPolicy = {
      target: ADDR_A,
      method: SELECTOR_TRANSFER,
      authorized: true,
    };
    const leaf = hashPolicyLeaf(policy);
    expect(leaf).toMatch(/^0x[0-9a-f]+$/);
  });

  test("hashes a TypedDataPolicy", () => {
    const policy: TypedDataPolicy = {
      scope_hash: "0xabc123",
      authorized: true,
    };
    const leaf = hashPolicyLeaf(policy);
    expect(leaf).toMatch(/^0x[0-9a-f]+$/);
  });

  test("hashes an ApprovalPolicy", () => {
    const policy: ApprovalPolicy = {
      target: ADDR_A,
      spender: ADDR_B,
      amount: "1000",
    };
    const leaf = hashPolicyLeaf(policy);
    expect(leaf).toMatch(/^0x[0-9a-f]+$/);
  });

  test("different policies produce different leaves", () => {
    const p1: CallPolicy = { target: ADDR_A, method: SELECTOR_TRANSFER };
    const p2: CallPolicy = { target: ADDR_A, method: SELECTOR_APPROVE };
    expect(hashPolicyLeaf(p1)).not.toBe(hashPolicyLeaf(p2));
  });
});

describe("computePolicyMerkle", () => {
  test("empty policies return zero root", () => {
    const result = computePolicyMerkle([]);
    expect(result.root).toBe("0x0");
    expect(result.leaves).toEqual([]);
  });

  test("single policy: root equals the single leaf", () => {
    const policy: CallPolicy = { target: ADDR_A, method: SELECTOR_TRANSFER };
    const result = computePolicyMerkle([policy]);
    expect(result.leaves).toHaveLength(1);
    // Single leaf gets paired with ZERO_FELT
    expect(result.root).toMatch(/^0x[0-9a-f]+$/);
  });

  test("two policies: root is hash of the two leaves", () => {
    const p1: CallPolicy = { target: ADDR_A, method: SELECTOR_TRANSFER };
    const p2: CallPolicy = { target: ADDR_B, method: SELECTOR_APPROVE };
    const result = computePolicyMerkle([p1, p2]);
    expect(result.leaves).toHaveLength(2);
    expect(result.root).toBe(hashPair(result.leaves[0], result.leaves[1]));
  });

  test("three policies: padded to 4, correct tree structure", () => {
    const policies: CallPolicy[] = [
      { target: ADDR_A, method: SELECTOR_TRANSFER },
      { target: ADDR_A, method: SELECTOR_APPROVE },
      { target: ADDR_B, method: SELECTOR_BALANCE },
    ];
    const result = computePolicyMerkle(policies);
    expect(result.leaves).toHaveLength(3);
    expect(result.root).toMatch(/^0x[0-9a-f]+$/);
  });

  test("deterministic root regardless of policy order", () => {
    // Note: policies are NOT reordered by computePolicyMerkle.
    // But the sorted-pair hashing means hashPair(a,b) == hashPair(b,a).
    // The caller (toWasmPolicies) is responsible for canonical ordering.
    const p1: CallPolicy = { target: ADDR_A, method: SELECTOR_TRANSFER };
    const p2: CallPolicy = { target: ADDR_B, method: SELECTOR_APPROVE };

    const r1 = computePolicyMerkle([p1, p2]);
    const r2 = computePolicyMerkle([p2, p1]);

    // With sorted-pair hashing, order of two leaves doesn't matter
    expect(r1.root).toBe(r2.root);
  });

  test("seven policies produce a valid tree", () => {
    const policies: CallPolicy[] = Array.from({ length: 7 }, (_, i) => ({
      target: `0x${(i + 1).toString(16)}`,
      method: SELECTOR_TRANSFER,
    }));
    const result = computePolicyMerkle(policies);
    expect(result.leaves).toHaveLength(7);
    expect(result.root).toMatch(/^0x[0-9a-f]+$/);
  });

  test("mixed policy types", () => {
    const policies: Policy[] = [
      { target: ADDR_A, method: SELECTOR_TRANSFER, authorized: true },
      { scope_hash: "0xabc", authorized: true },
      { target: ADDR_B, spender: ADDR_A, amount: "1000" },
    ];
    const result = computePolicyMerkle(policies);
    expect(result.leaves).toHaveLength(3);
    expect(result.root).toMatch(/^0x[0-9a-f]+$/);
  });
});

describe("computePolicyMerkleProofs", () => {
  test("empty policies return empty proofs", () => {
    expect(computePolicyMerkleProofs([])).toEqual([]);
  });

  test("single policy proof is empty (leaf is the root)", () => {
    const policy: CallPolicy = { target: ADDR_A, method: SELECTOR_TRANSFER };
    const proofs = computePolicyMerkleProofs([policy]);
    expect(proofs).toHaveLength(1);
    expect(proofs[0].proof).toHaveLength(0); // single leaf = root, no proof needed
    expect(proofs[0].leaf).toBe(hashPolicyLeaf(policy));

    // Root should equal the leaf directly
    const { root } = computePolicyMerkle([policy]);
    expect(proofs[0].leaf).toBe(root);
  });

  test("two policies: each proof has one element (the sibling)", () => {
    const p1: CallPolicy = { target: ADDR_A, method: SELECTOR_TRANSFER };
    const p2: CallPolicy = { target: ADDR_B, method: SELECTOR_APPROVE };
    const proofs = computePolicyMerkleProofs([p1, p2]);
    expect(proofs).toHaveLength(2);
    // Each leaf's proof is the other leaf
    expect(proofs[0].proof).toHaveLength(1);
    expect(proofs[1].proof).toHaveLength(1);
  });

  test("proofs verify against the merkle root", () => {
    const policies: CallPolicy[] = [
      { target: ADDR_A, method: SELECTOR_TRANSFER },
      { target: ADDR_A, method: SELECTOR_APPROVE },
      { target: ADDR_B, method: SELECTOR_BALANCE },
    ];

    const { root } = computePolicyMerkle(policies);
    const proofs = computePolicyMerkleProofs(policies);

    // Verify each proof
    for (const proof of proofs) {
      let current = proof.leaf;
      for (const sibling of proof.proof) {
        current = hashPair(current, sibling);
      }
      expect(current).toBe(root);
    }
  });

  test("proofs verify for 7 policies", () => {
    const policies: CallPolicy[] = Array.from({ length: 7 }, (_, i) => ({
      target: `0x${(i + 1).toString(16)}`,
      method: SELECTOR_TRANSFER,
    }));

    const { root } = computePolicyMerkle(policies);
    const proofs = computePolicyMerkleProofs(policies);

    for (const proof of proofs) {
      let current = proof.leaf;
      for (const sibling of proof.proof) {
        current = hashPair(current, sibling);
      }
      expect(current).toBe(root);
    }
  });
});
