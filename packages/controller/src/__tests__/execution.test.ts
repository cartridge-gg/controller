import { ec, encode, hash, shortString } from "starknet";
import {
  buildSignedOutsideExecutionV3,
  createPolicyProofIndex,
} from "../session/ts/execution";
import {
  computePolicyMerkle,
  computePolicyMerkleProofs,
} from "../session/ts/merkle";
import type { CallPolicy } from "../session/ts/types";
import { normalizeFelt } from "../session/ts/shared";

const TEST_PRIVATE_KEY = "0x1";
const TEST_ADDRESS =
  "0x0000000000000000000000000000000000000000000000000000000000001234";
const TEST_OWNER_GUID = "0x5678";
const TEST_CHAIN_ID = "SN_SEPOLIA";

const TRANSFER_SELECTOR = normalizeFelt(hash.getSelectorFromName("transfer"));

const policies: CallPolicy[] = [
  {
    target:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    method: TRANSFER_SELECTOR,
    authorized: true,
  },
];

function buildTestContext() {
  const { root } = computePolicyMerkle(policies);
  const proofs = computePolicyMerkleProofs(policies);
  const policyProofIndex = createPolicyProofIndex(proofs);
  const publicKey = ec.starkCurve.getStarkKey(
    encode.addHexPrefix(TEST_PRIVATE_KEY),
  );
  const domain = shortString.encodeShortString("Starknet Signer");
  const sessionKeyGuid = normalizeFelt(
    hash.computePoseidonHash(normalizeFelt(domain), publicKey),
  );

  return { root, policyProofIndex, sessionKeyGuid };
}

describe("buildSignedOutsideExecutionV3", () => {
  test("produces a valid signed outside execution", () => {
    const { root, policyProofIndex, sessionKeyGuid } = buildTestContext();

    const result = buildSignedOutsideExecutionV3({
      calls: [
        {
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "transfer",
          calldata: ["0x1", "0x2", "0x0"],
        },
      ],
      chainId: TEST_CHAIN_ID,
      session: {
        username: "test",
        address: TEST_ADDRESS,
        ownerGuid: TEST_OWNER_GUID,
        expiresAt: "9999999999",
        guardianKeyGuid: "0x0",
        metadataHash: "0x0",
        sessionKeyGuid,
      },
      sessionPrivateKey: TEST_PRIVATE_KEY,
      policyRoot: root,
      sessionKeyGuid,
      policyProofIndex,
      nowSeconds: 1000000,
    });

    expect(result.outsideExecution).toBeDefined();
    expect(result.signature).toBeDefined();
    expect(result.signature.length).toBeGreaterThan(0);

    // Signature starts with session-token magic
    const sessionTokenMagic = normalizeFelt(
      shortString.encodeShortString("session-token"),
    );
    expect(result.signature[0]).toBe(sessionTokenMagic);
  });

  test("outsideExecution has correct structure", () => {
    const { root, policyProofIndex, sessionKeyGuid } = buildTestContext();

    const result = buildSignedOutsideExecutionV3({
      calls: [
        {
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "transfer",
          calldata: ["0x1"],
        },
      ],
      chainId: TEST_CHAIN_ID,
      session: {
        username: "test",
        address: TEST_ADDRESS,
        ownerGuid: TEST_OWNER_GUID,
        expiresAt: "9999999999",
        guardianKeyGuid: "0x0",
        metadataHash: "0x0",
        sessionKeyGuid,
      },
      sessionPrivateKey: TEST_PRIVATE_KEY,
      policyRoot: root,
      sessionKeyGuid,
      policyProofIndex,
      nowSeconds: 1000000,
    });

    const oe = result.outsideExecution;
    expect(oe.caller).toMatch(/^0x/);
    expect(oe.nonce).toHaveLength(2);
    expect(oe.nonce[1]).toBe("0x1"); // non-sequential nonce mode
    expect(oe.execute_after).toMatch(/^0x/);
    expect(oe.execute_before).toMatch(/^0x/);
    expect(oe.calls).toHaveLength(1);
    expect(oe.calls[0].to).toMatch(/^0x/);
    expect(oe.calls[0].selector).toMatch(/^0x/);
  });

  test("throws for empty calls", () => {
    const { root, policyProofIndex, sessionKeyGuid } = buildTestContext();

    expect(() =>
      buildSignedOutsideExecutionV3({
        calls: [],
        chainId: TEST_CHAIN_ID,
        session: {
          username: "test",
          address: TEST_ADDRESS,
          ownerGuid: TEST_OWNER_GUID,
          expiresAt: "9999999999",
          guardianKeyGuid: "0x0",
          metadataHash: "0x0",
          sessionKeyGuid,
        },
        sessionPrivateKey: TEST_PRIVATE_KEY,
        policyRoot: root,
        sessionKeyGuid,
        policyProofIndex,
      }),
    ).toThrow("At least one call is required");
  });

  test("throws for calls not in policy", () => {
    const { root, policyProofIndex, sessionKeyGuid } = buildTestContext();

    expect(() =>
      buildSignedOutsideExecutionV3({
        calls: [
          {
            contractAddress: "0xdead",
            entrypoint: "steal_funds",
            calldata: [],
          },
        ],
        chainId: TEST_CHAIN_ID,
        session: {
          username: "test",
          address: TEST_ADDRESS,
          ownerGuid: TEST_OWNER_GUID,
          expiresAt: "9999999999",
          guardianKeyGuid: "0x0",
          metadataHash: "0x0",
          sessionKeyGuid,
        },
        sessionPrivateKey: TEST_PRIVATE_KEY,
        policyRoot: root,
        sessionKeyGuid,
        policyProofIndex,
      }),
    ).toThrow("not authorized by session policies");
  });

  test("respects custom time bounds", () => {
    const { root, policyProofIndex, sessionKeyGuid } = buildTestContext();

    const result = buildSignedOutsideExecutionV3({
      calls: [
        {
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "transfer",
          calldata: [],
        },
      ],
      timeBounds: {
        executeAfter: 100,
        executeBefore: 2000,
      },
      chainId: TEST_CHAIN_ID,
      session: {
        username: "test",
        address: TEST_ADDRESS,
        ownerGuid: TEST_OWNER_GUID,
        expiresAt: "9999999999",
        guardianKeyGuid: "0x0",
        metadataHash: "0x0",
        sessionKeyGuid,
      },
      sessionPrivateKey: TEST_PRIVATE_KEY,
      policyRoot: root,
      sessionKeyGuid,
      policyProofIndex,
    });

    expect(result.outsideExecution.execute_after).toBe(normalizeFelt(100));
    expect(result.outsideExecution.execute_before).toBe(normalizeFelt(2000));
  });
});

describe("createPolicyProofIndex", () => {
  test("indexes proofs by contractAddress:selector", () => {
    const proofs = computePolicyMerkleProofs(policies);
    const index = createPolicyProofIndex(proofs);
    expect(index.size).toBe(1);
  });

  test("deduplicates identical keys", () => {
    const proofs = computePolicyMerkleProofs(policies);
    // Double the proofs
    const index = createPolicyProofIndex([...proofs, ...proofs]);
    expect(index.size).toBe(1);
  });
});
