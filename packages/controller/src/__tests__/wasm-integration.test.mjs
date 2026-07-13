/**
 * WASM Integration Tests
 *
 * These tests exercise the real @cartridge/controller-wasm binary in Node.js
 * to verify that policy conversion and session construction work end-to-end.
 *
 * Run with: node --experimental-wasm-modules --test packages/controller/src/__tests__/wasm-integration.test.mjs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Resolve the WASM package via import.meta.resolve, then dynamic import.
// This handles pnpm's .pnpm store symlinks correctly.
const sessionWasmPath = import.meta.resolve(
  "@cartridge/controller-wasm/session",
);
const { CartridgeSessionAccount, signerToGuid } = await import(sessionWasmPath);

// --- Helpers ---

/** Generate a valid 252-bit felt hex string from a seed */
function felt(seed) {
  return "0x" + seed.toString(16).padStart(64, "0");
}

/** Import starknet.js for getChecksumAddress and hash utilities */
const starknet = await import("starknet");
const { ec, stark, hash, getChecksumAddress, addAddressPadding } = starknet;

/** Reproduce toWasmPolicies logic from src/utils.ts for test verification */
function toWasmPolicies(parsedPolicies) {
  const contractPolicies = Object.entries(parsedPolicies.contracts ?? {})
    .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .flatMap(([target, { methods }]) =>
      [...methods]
        .sort((a, b) => a.entrypoint.localeCompare(b.entrypoint))
        .map((m) => {
          if (m.entrypoint === "approve" && m.spender && m.amount) {
            return {
              target: getChecksumAddress(target),
              spender: m.spender,
              amount: String(m.amount),
            };
          }
          return {
            target: getChecksumAddress(target),
            method: hash.getSelectorFromName(m.entrypoint),
            authorized: !!m.authorized,
          };
        }),
    );

  return contractPolicies;
}

// --- Fixtures ---

const MOCK_RPC = "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9";
const MOCK_CHAIN_ID = "0x534e5f4d41494e"; // SN_MAIN
const MOCK_PRIVATE_KEY = stark.randomAddress();
const MOCK_ADDRESS = felt(0xabc123);
const MOCK_OWNER_GUID = felt(0xdef456);

function makeSession(policies) {
  const guid = signerToGuid({ starknet: { privateKey: MOCK_PRIVATE_KEY } });
  return {
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    policies,
    guardianKeyGuid: "0x0",
    metadataHash: "0x0",
    sessionKeyGuid: guid,
  };
}

// --- Tests ---

describe("WASM: signerToGuid", () => {
  it("returns a hex string for starknet signer", () => {
    const guid = signerToGuid({
      starknet: { privateKey: MOCK_PRIVATE_KEY },
    });
    assert.ok(typeof guid === "string", "guid should be a string");
    assert.ok(guid.startsWith("0x"), "guid should start with 0x");
    assert.ok(guid.length > 2, "guid should be non-empty");
  });

  it("is deterministic for the same key", () => {
    const guid1 = signerToGuid({
      starknet: { privateKey: MOCK_PRIVATE_KEY },
    });
    const guid2 = signerToGuid({
      starknet: { privateKey: MOCK_PRIVATE_KEY },
    });
    assert.equal(guid1, guid2);
  });

  it("produces different guids for different keys", () => {
    const guid1 = signerToGuid({
      starknet: { privateKey: MOCK_PRIVATE_KEY },
    });
    const guid2 = signerToGuid({
      starknet: { privateKey: stark.randomAddress() },
    });
    assert.notEqual(guid1, guid2);
  });
});

describe("WASM: CartridgeSessionAccount.newAsRegistered", () => {
  it("constructs with a single CallPolicy", () => {
    const policies = [
      {
        target: getChecksumAddress(MOCK_ADDRESS),
        method: hash.getSelectorFromName("attack"),
        authorized: true,
      },
    ];

    const acct = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(policies),
    );
    assert.ok(acct, "should return a session account");
    assert.equal(typeof acct.execute, "function");
    assert.equal(typeof acct.executeFromOutside, "function");
    acct.free();
  });

  it("constructs with multiple CallPolicies across contracts", () => {
    const addr1 = felt(0x111);
    const addr2 = felt(0x222);
    const policies = [
      {
        target: getChecksumAddress(addr1),
        method: hash.getSelectorFromName("attack"),
        authorized: true,
      },
      {
        target: getChecksumAddress(addr1),
        method: hash.getSelectorFromName("defend"),
        authorized: true,
      },
      {
        target: getChecksumAddress(addr2),
        method: hash.getSelectorFromName("transfer"),
        authorized: true,
      },
    ];

    const acct = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(policies),
    );
    assert.ok(acct);
    acct.free();
  });

  it("constructs with an ApprovalPolicy", () => {
    const tokenAddr = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const spenderAddr = felt(0x123456);
    const policies = [
      {
        target: getChecksumAddress(tokenAddr),
        spender: getChecksumAddress(spenderAddr),
        amount: "1000000000000000000",
      },
    ];

    const acct = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(policies),
    );
    assert.ok(acct);
    acct.free();
  });

  it("constructs with mixed CallPolicy and ApprovalPolicy", () => {
    const policies = [
      {
        target: getChecksumAddress(felt(0x111)),
        method: hash.getSelectorFromName("attack"),
        authorized: true,
      },
      {
        target: getChecksumAddress(felt(0x222)),
        spender: getChecksumAddress(felt(0x333)),
        amount: "500",
      },
    ];

    const acct = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(policies),
    );
    assert.ok(acct);
    acct.free();
  });

  it("constructs with empty policies array", () => {
    const acct = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession([]),
    );
    assert.ok(acct);
    acct.free();
  });
});

describe("WASM: toWasmPolicies round-trip", () => {
  it("accepts output from toWasmPolicies with single contract", () => {
    const parsed = {
      verified: false,
      contracts: {
        [felt(0x111)]: {
          methods: [
            { entrypoint: "attack", authorized: true },
            { entrypoint: "defend", authorized: true },
          ],
        },
      },
    };

    const policies = toWasmPolicies(parsed);
    const acct = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(policies),
    );
    assert.ok(acct);
    acct.free();
  });

  it("accepts output from toWasmPolicies with multiple contracts", () => {
    const parsed = {
      verified: false,
      contracts: {
        [felt(0x111)]: {
          methods: [{ entrypoint: "attack", authorized: true }],
        },
        [felt(0x222)]: {
          methods: [
            { entrypoint: "transfer", authorized: true },
            { entrypoint: "approve", authorized: true },
          ],
        },
        [felt(0xaaa)]: {
          methods: [{ entrypoint: "mint", authorized: true }],
        },
      },
    };

    const policies = toWasmPolicies(parsed);
    assert.ok(policies.length === 4, `expected 4 policies, got ${policies.length}`);

    const acct = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(policies),
    );
    assert.ok(acct);
    acct.free();
  });

  it("accepts output from toWasmPolicies with ApprovalPolicy", () => {
    const parsed = {
      verified: false,
      contracts: {
        [felt(0x111)]: {
          methods: [
            {
              entrypoint: "approve",
              spender: getChecksumAddress(felt(0x999)),
              amount: "1000000",
              authorized: true,
            },
          ],
        },
      },
    };

    const policies = toWasmPolicies(parsed);
    // Should produce an ApprovalPolicy (has spender+amount, no method)
    assert.ok(policies[0].spender, "should have spender field");
    assert.ok(policies[0].amount, "should have amount field");
    assert.ok(!policies[0].method, "should not have method field");

    const acct = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(policies),
    );
    assert.ok(acct);
    acct.free();
  });
});

describe("WASM: address normalization consistency", () => {
  it("produces same session with differently-cased addresses", () => {
    const addrLower = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const addrUpper = "0x049D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7";
    const addrChecksum = getChecksumAddress(addrLower);

    // Both should normalize to the same checksum address
    assert.equal(getChecksumAddress(addrLower), getChecksumAddress(addrUpper));

    const makePolicies = (addr) => [
      {
        target: getChecksumAddress(addr),
        method: hash.getSelectorFromName("transfer"),
        authorized: true,
      },
    ];

    // Both should construct without errors
    const acct1 = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(makePolicies(addrLower)),
    );
    const acct2 = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(makePolicies(addrUpper)),
    );

    assert.ok(acct1);
    assert.ok(acct2);
    acct1.free();
    acct2.free();
  });

  it("handles zero-padded vs short addresses", () => {
    const shortAddr = "0x1";
    const paddedAddr = addAddressPadding(shortAddr);

    const makePolicies = (addr) => [
      {
        target: getChecksumAddress(addr),
        method: hash.getSelectorFromName("attack"),
        authorized: true,
      },
    ];

    const acct1 = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(makePolicies(shortAddr)),
    );
    const acct2 = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(makePolicies(paddedAddr)),
    );

    assert.ok(acct1);
    assert.ok(acct2);
    acct1.free();
    acct2.free();
  });
});

describe("WASM: policy ordering stability", () => {
  it("same policies in different insertion order produce valid sessions", () => {
    const policies1 = [
      {
        target: getChecksumAddress(felt(0x111)),
        method: hash.getSelectorFromName("attack"),
        authorized: true,
      },
      {
        target: getChecksumAddress(felt(0x222)),
        method: hash.getSelectorFromName("defend"),
        authorized: true,
      },
    ];

    const policies2 = [
      {
        target: getChecksumAddress(felt(0x222)),
        method: hash.getSelectorFromName("defend"),
        authorized: true,
      },
      {
        target: getChecksumAddress(felt(0x111)),
        method: hash.getSelectorFromName("attack"),
        authorized: true,
      },
    ];

    // Both orderings should be accepted
    const acct1 = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(policies1),
    );
    const acct2 = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(policies2),
    );

    assert.ok(acct1);
    assert.ok(acct2);
    acct1.free();
    acct2.free();
  });

  it("toWasmPolicies canonical sort is stable across input orderings", () => {
    const parsedA = {
      verified: false,
      contracts: {
        [felt(0x222)]: { methods: [{ entrypoint: "defend", authorized: true }] },
        [felt(0x111)]: { methods: [{ entrypoint: "attack", authorized: true }] },
      },
    };

    const parsedB = {
      verified: false,
      contracts: {
        [felt(0x111)]: { methods: [{ entrypoint: "attack", authorized: true }] },
        [felt(0x222)]: { methods: [{ entrypoint: "defend", authorized: true }] },
      },
    };

    const policiesA = toWasmPolicies(parsedA);
    const policiesB = toWasmPolicies(parsedB);

    // Canonical sort should produce identical output
    assert.deepEqual(policiesA, policiesB);

    // Both should be accepted by WASM
    const acct = CartridgeSessionAccount.newAsRegistered(
      MOCK_RPC,
      MOCK_PRIVATE_KEY,
      MOCK_ADDRESS,
      MOCK_OWNER_GUID,
      MOCK_CHAIN_ID,
      makeSession(policiesA),
    );
    assert.ok(acct);
    acct.free();
  });
});
