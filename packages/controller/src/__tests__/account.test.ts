import { hash } from "starknet";
import { CartridgeSessionAccount } from "../session/internal/account";
import { isSnip9CompatibilityError } from "../session/internal/errors";
import type { CallPolicy, Session } from "../session/internal/types";
import { normalizeFelt } from "../session/internal/utils";

// Mock global fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

const TRANSFER_SELECTOR = normalizeFelt(hash.getSelectorFromName("transfer"));
const TEST_RPC = "https://rpc.test";
const TEST_PRIVATE_KEY = "0x1";
const TEST_ADDRESS = "0x1234";
const TEST_OWNER_GUID = "0x5678";
const TEST_CHAIN_ID = "SN_SEPOLIA";

const TEST_POLICIES: CallPolicy[] = [
  {
    target:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    method: TRANSFER_SELECTOR,
    authorized: true,
  },
];

const TEST_SESSION: Session = {
  policies: TEST_POLICIES,
  expiresAt: 9999999999,
  metadataHash: "0x0",
  sessionKeyGuid: "0x0",
  guardianKeyGuid: "0x0",
};

describe("CartridgeSessionAccount", () => {
  test("newAsRegistered creates an instance", () => {
    const account = CartridgeSessionAccount.newAsRegistered(
      TEST_RPC,
      TEST_PRIVATE_KEY,
      TEST_ADDRESS,
      TEST_OWNER_GUID,
      TEST_CHAIN_ID,
      TEST_SESSION,
    );
    expect(account).toBeInstanceOf(CartridgeSessionAccount);
  });

  test("executeFromOutside sends correct RPC request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        result: { transaction_hash: "0xtxhash" },
      }),
    });

    const account = CartridgeSessionAccount.newAsRegistered(
      TEST_RPC,
      TEST_PRIVATE_KEY,
      TEST_ADDRESS,
      TEST_OWNER_GUID,
      TEST_CHAIN_ID,
      TEST_SESSION,
    );

    const result = await account.executeFromOutside([
      {
        contractAddress:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        entrypoint: "transfer",
        calldata: ["0x1", "0x2", "0x0"],
      },
    ]);

    expect(result.transaction_hash).toBe("0xtxhash");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(TEST_RPC);
    const body = JSON.parse(options.body);
    expect(body.method).toBe("cartridge_addExecuteOutsideTransaction");
    expect(body.params.address).toBe(TEST_ADDRESS);
    expect(body.params.outside_execution).toBeDefined();
    expect(body.params.signature).toBeDefined();
    expect(Array.isArray(body.params.signature)).toBe(true);
  });

  test("executeFromOutside throws on RPC error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        error: { code: -32000, message: "execution failed" },
      }),
    });

    const account = CartridgeSessionAccount.newAsRegistered(
      TEST_RPC,
      TEST_PRIVATE_KEY,
      TEST_ADDRESS,
      TEST_OWNER_GUID,
      TEST_CHAIN_ID,
      TEST_SESSION,
    );

    await expect(
      account.executeFromOutside([
        {
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "transfer",
          calldata: [],
        },
      ]),
    ).rejects.toThrow("execution failed");
  });

  test("internal CartridgeSessionAccount only exposes executeFromOutside, not execute", () => {
    const account = CartridgeSessionAccount.newAsRegistered(
      TEST_RPC,
      TEST_PRIVATE_KEY,
      TEST_ADDRESS,
      TEST_OWNER_GUID,
      TEST_CHAIN_ID,
      TEST_SESSION,
    );
    expect((account as any).execute).toBeUndefined();
    expect(account.executeFromOutside).toBeDefined();
  });

  test("executeFromOutside propagates non-SNIP-9 errors without swallowing", async () => {
    const networkError = new Error("network timeout");
    mockFetch.mockRejectedValueOnce(networkError);

    const account = CartridgeSessionAccount.newAsRegistered(
      TEST_RPC,
      TEST_PRIVATE_KEY,
      TEST_ADDRESS,
      TEST_OWNER_GUID,
      TEST_CHAIN_ID,
      TEST_SESSION,
    );

    await expect(
      account.executeFromOutside([
        {
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "transfer",
          calldata: [],
        },
      ]),
    ).rejects.toThrow("network timeout");
  });

  describe("isSnip9CompatibilityError", () => {
    test("returns true for OUTSIDE_EXECUTION_NOT_SUPPORTED code", () => {
      const err = Object.assign(new Error("failed"), {
        code: "OUTSIDE_EXECUTION_NOT_SUPPORTED",
      });
      expect(isSnip9CompatibilityError(err)).toBe(true);
    });

    test("returns true for snip-9 message patterns", () => {
      expect(
        isSnip9CompatibilityError(
          new Error("account is not compatible with snip-9"),
        ),
      ).toBe(true);
      expect(
        isSnip9CompatibilityError(new Error("entrypoint does not exist")),
      ).toBe(true);
      expect(
        isSnip9CompatibilityError(
          new Error("not implemented: outside execution"),
        ),
      ).toBe(true);
    });

    test("returns false for generic errors", () => {
      expect(isSnip9CompatibilityError(new Error("network timeout"))).toBe(
        false,
      );
      expect(
        isSnip9CompatibilityError(new Error("policy not authorized")),
      ).toBe(false);
      expect(isSnip9CompatibilityError(new Error("execution failed"))).toBe(
        false,
      );
    });

    test("returns false for null/undefined", () => {
      expect(isSnip9CompatibilityError(null)).toBe(false);
      expect(isSnip9CompatibilityError(undefined)).toBe(false);
    });

    test("checks nested cause for error code", () => {
      const cause = Object.assign(new Error("inner"), {
        code: "OUTSIDE_EXECUTION_UNSUPPORTED",
      });
      const err = Object.assign(new Error("outer"), { cause });
      expect(isSnip9CompatibilityError(err)).toBe(true);
    });
  });

  test("executeFromOutside propagates policy-mismatch errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        error: { code: -32000, message: "policy not authorized" },
      }),
    });

    const account = CartridgeSessionAccount.newAsRegistered(
      TEST_RPC,
      TEST_PRIVATE_KEY,
      TEST_ADDRESS,
      TEST_OWNER_GUID,
      TEST_CHAIN_ID,
      TEST_SESSION,
    );

    await expect(
      account.executeFromOutside([
        {
          contractAddress:
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          entrypoint: "transfer",
          calldata: [],
        },
      ]),
    ).rejects.toThrow("policy not authorized");
  });
});
