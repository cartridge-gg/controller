import { hash } from "starknet";
import {
  hashPair,
  hashPolicyLeaf,
  computePolicyMerkle,
  computePolicyMerkleProofs,
} from "../session/internal/merkle";
import { normalizeFelt } from "../session/internal/utils";
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
});

describe("hashPolicyLeaf", () => {
  test("different policies produce different leaves", () => {
    const p1: CallPolicy = { target: ADDR_A, method: SELECTOR_TRANSFER };
    const p2: CallPolicy = { target: ADDR_A, method: SELECTOR_APPROVE };
    expect(hashPolicyLeaf(p1)).not.toBe(hashPolicyLeaf(p2));
  });

  test("TypedDataPolicy uses a different type hash than CallPolicy", () => {
    const scopeHash = "0xabc";
    const typedData: TypedDataPolicy = { scope_hash: scopeHash };
    const call: CallPolicy = { target: scopeHash, method: scopeHash };
    expect(hashPolicyLeaf(typedData)).not.toBe(hashPolicyLeaf(call));
  });

  test("TypedDataPolicy leaf matches manual Poseidon(AllowedType hash, scope_hash)", () => {
    const scopeHash = "0xdeadbeef";
    const policy: TypedDataPolicy = { scope_hash: scopeHash };
    const expectedTypeHash = normalizeFelt(
      hash.getSelectorFromName('"Allowed Type"("Scope Hash":"felt")'),
    );
    const expected = normalizeFelt(
      hash.computePoseidonHashOnElements([
        expectedTypeHash,
        normalizeFelt(scopeHash),
      ]),
    );
    expect(hashPolicyLeaf(policy)).toBe(expected);
  });

  test("ApprovalPolicy hashes identically to CallPolicy(target, approve)", () => {
    const approval: ApprovalPolicy = {
      target: ADDR_A,
      spender: ADDR_B,
      amount: "1000",
    };
    const equivalentCall: CallPolicy = {
      target: ADDR_A,
      method: SELECTOR_APPROVE,
    };
    expect(hashPolicyLeaf(approval)).toBe(hashPolicyLeaf(equivalentCall));
  });

  test("ApprovalPolicy leaf is independent of spender and amount", () => {
    const a1: ApprovalPolicy = {
      target: ADDR_A,
      spender: ADDR_B,
      amount: "1000",
    };
    const a2: ApprovalPolicy = {
      target: ADDR_A,
      spender: "0xdead",
      amount: "9999",
    };
    expect(hashPolicyLeaf(a1)).toBe(hashPolicyLeaf(a2));
  });

  test("unauthorized CallPolicy returns zero felt", () => {
    const policy: CallPolicy = {
      target: ADDR_A,
      method: SELECTOR_TRANSFER,
      authorized: false,
    };
    expect(hashPolicyLeaf(policy)).toBe("0x0");
  });

  test("unauthorized TypedDataPolicy returns zero felt", () => {
    const policy: TypedDataPolicy = {
      scope_hash: "0xabc",
      authorized: false,
    };
    expect(hashPolicyLeaf(policy)).toBe("0x0");
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
    expect(result.root).toBe(result.leaves[0]);
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
    const p1: CallPolicy = { target: ADDR_A, method: SELECTOR_TRANSFER };
    const p2: CallPolicy = { target: ADDR_B, method: SELECTOR_APPROVE };
    const r1 = computePolicyMerkle([p1, p2]);
    const r2 = computePolicyMerkle([p2, p1]);
    expect(r1.root).toBe(r2.root);
  });
});

describe("computePolicyMerkleProofs", () => {
  test("empty policies return empty proofs", () => {
    expect(computePolicyMerkleProofs([])).toEqual([]);
  });

  test("single policy proof is empty (leaf is the root)", () => {
    const policy: CallPolicy = { target: ADDR_A, method: SELECTOR_TRANSFER };
    const proofs = computePolicyMerkleProofs([policy]);
    expect(proofs[0].proof).toHaveLength(0);
    const { root } = computePolicyMerkle([policy]);
    expect(proofs[0].leaf).toBe(root);
  });

  test("proofs verify against the merkle root", () => {
    const policies: CallPolicy[] = [
      { target: ADDR_A, method: SELECTOR_TRANSFER },
      { target: ADDR_A, method: SELECTOR_APPROVE },
      { target: ADDR_B, method: SELECTOR_BALANCE },
    ];

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

  test("ApprovalPolicy proof uses the approve selector, not zero", () => {
    const approval: ApprovalPolicy = {
      target: ADDR_A,
      spender: ADDR_B,
      amount: "1000",
    };
    const proofs = computePolicyMerkleProofs([approval]);
    expect(proofs[0].selector).toBe(
      normalizeFelt(hash.getSelectorFromName("approve")),
    );
  });

  test("TypedDataPolicy proof uses zero selector", () => {
    const td: TypedDataPolicy = { scope_hash: "0xabc", authorized: true };
    const proofs = computePolicyMerkleProofs([td]);
    expect(proofs[0].selector).toBe("0x0");
    expect(proofs[0].contractAddress).toBe("0x0");
  });

  test("mixed-type tree proofs all verify against the same root", () => {
    const policies: Policy[] = [
      { target: ADDR_A, method: SELECTOR_TRANSFER, authorized: true },
      { scope_hash: "0xabc", authorized: true },
      { target: ADDR_B, spender: ADDR_A, amount: "1000" },
    ];

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
