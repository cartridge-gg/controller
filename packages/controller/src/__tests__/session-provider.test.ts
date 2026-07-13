// Mock starknet partially — stark.randomAddress is non-configurable, so jest.spyOn fails.
const MOCK_PK =
  "0x01234567890abcdef01234567890abcdef01234567890abcdef01234567890ab";

jest.mock("starknet", () => {
  const actual = jest.requireActual("starknet");
  return {
    ...actual,
    stark: {
      ...actual.stark,
      randomAddress: jest.fn(() => MOCK_PK),
    },
  };
});

jest.mock("@cartridge/controller-wasm", () => ({
  signerToGuid: jest.fn(() => "0xmockguid"),
  subscribeCreateSession: jest.fn(),
}));

jest.mock("@cartridge/presets", () => ({
  loadConfig: jest.fn(),
}));

jest.mock("../session/account", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((_provider: any, opts: any) => ({
    address: opts.address,
    execute: jest.fn(),
  })),
}));

jest.mock("../provider", () => {
  function MockBaseProvider(this: any) {
    this.account = undefined;
    this.subscriptions = [];
    this.emitAccountsChanged = jest.fn();
    this.emitNetworkChanged = jest.fn();
  }
  MockBaseProvider.prototype.safeProbe = function () {
    return Promise.resolve(this.account);
  };
  return { __esModule: true, default: MockBaseProvider };
});

import { ec, stark } from "starknet";
import { signerToGuid } from "@cartridge/controller-wasm";
import SessionProvider from "../session/provider";
import { ParsedSessionPolicies } from "../policies";

const mockRandomAddress = stark.randomAddress as jest.Mock;
const mockSignerToGuid = signerToGuid as jest.Mock;

// --- Fixtures ---

const MOCK_PRIVATE_KEY = MOCK_PK;
const MOCK_PUBLIC_KEY = ec.starkCurve.getStarkKey(MOCK_PRIVATE_KEY);
const MOCK_SESSION_KEY_GUID = "0xmockguid";
const MOCK_RPC = "https://api.cartridge.gg/x/starknet/mainnet/rpc/v0_9";
const MOCK_CHAIN_ID = "0x534e5f4d41494e";
const MOCK_REDIRECT = "https://game.example.com/callback";

const VALID_SESSION = {
  username: "testuser",
  address: "0xabc",
  ownerGuid: "0xowner",
  expiresAt: String(Math.floor(Date.now() / 1000) + 3600),
  guardianKeyGuid: "0x0",
  metadataHash: "0x0",
  sessionKeyGuid: MOCK_SESSION_KEY_GUID,
};

const VALID_POLICIES: ParsedSessionPolicies = {
  verified: false,
  contracts: {
    "0x1": {
      methods: [{ entrypoint: "attack", authorized: true }],
    },
  },
};

// --- localStorage helper ---

type MockStorage = { [key: string]: string };

function createMockLocalStorage() {
  const store: MockStorage = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    getItem: jest.fn((key: string) => (key in store ? store[key] : null)),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
    _store: store,
  } as Storage & { _store: MockStorage };
}

function setupWindowMocks() {
  (global as any).window = {
    open: jest.fn(),
    location: { search: "", pathname: "/", hash: "" },
    history: { replaceState: jest.fn() },
  };
  (global as any).document = { title: "test" };
  (global as any).atob = (str: string) => Buffer.from(str, "base64").toString();
  (global as any).btoa = (str: string) => Buffer.from(str).toString("base64");
}

describe("SessionProvider", () => {
  const originalLocalStorage = (global as any).localStorage;
  const originalWindow = (global as any).window;
  const originalDocument = (global as any).document;
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockRandomAddress.mockReturnValue(MOCK_PRIVATE_KEY);
    mockSignerToGuid.mockReturnValue(MOCK_SESSION_KEY_GUID);

    mockLocalStorage = createMockLocalStorage();
    (global as any).localStorage = mockLocalStorage;
    setupWindowMocks();
  });

  afterEach(() => {
    (global as any).localStorage = originalLocalStorage;
    (global as any).window = originalWindow;
    (global as any).document = originalDocument;
  });

  function createProvider(
    overrides: Partial<{
      rpc: string;
      chainId: string;
      policies: any;
      preset: string;
      shouldOverridePresetPolicies: boolean;
      redirectUrl: string;
      keychainUrl: string;
      apiUrl: string;
      signupOptions: any;
    }> = {},
  ) {
    return new SessionProvider({
      rpc: MOCK_RPC,
      chainId: MOCK_CHAIN_ID,
      policies: {
        contracts: { "0x1": { methods: [{ entrypoint: "attack" }] } },
      },
      redirectUrl: MOCK_REDIRECT,
      ...overrides,
    });
  }

  // ==========================================
  // Constructor
  // ==========================================

  describe("constructor", () => {
    it("throws when neither policies nor preset provided", () => {
      expect(
        () =>
          new SessionProvider({
            rpc: MOCK_RPC,
            chainId: MOCK_CHAIN_ID,
            redirectUrl: MOCK_REDIRECT,
          } as any),
      ).toThrow("Either `policies` or `preset` must be provided");
    });
  });

  // ==========================================
  // validatePoliciesSubset
  // ==========================================

  describe("validatePoliciesSubset", () => {
    function callValidate(
      provider: any,
      newPolicies: ParsedSessionPolicies,
      existingPolicies: ParsedSessionPolicies,
    ): boolean {
      return provider.validatePoliciesSubset(newPolicies, existingPolicies);
    }

    it("returns true when new policies are a subset of stored policies", () => {
      const provider = createProvider();
      const result = callValidate(provider, VALID_POLICIES, {
        verified: false,
        contracts: {
          "0x1": {
            methods: [
              { entrypoint: "attack", authorized: true },
              { entrypoint: "defend", authorized: true },
            ],
          },
        },
      });
      expect(result).toBe(true);
    });

    it("returns false when new policies contain unknown address", () => {
      const provider = createProvider();
      const result = callValidate(
        provider,
        {
          verified: false,
          contracts: {
            "0x999": {
              methods: [{ entrypoint: "attack", authorized: true }],
            },
          },
        },
        VALID_POLICIES,
      );
      expect(result).toBe(false);
    });

    it("returns false when new policies contain unknown method", () => {
      const provider = createProvider();
      const result = callValidate(
        provider,
        {
          verified: false,
          contracts: {
            "0x1": {
              methods: [{ entrypoint: "unknown_method", authorized: true }],
            },
          },
        },
        VALID_POLICIES,
      );
      expect(result).toBe(false);
    });

    it("returns false when stored method has authorized: false", () => {
      const provider = createProvider();
      const result = callValidate(
        provider,
        {
          verified: false,
          contracts: {
            "0x1": {
              methods: [{ entrypoint: "attack", authorized: true }],
            },
          },
        },
        {
          verified: false,
          contracts: {
            "0x1": {
              methods: [{ entrypoint: "attack", authorized: false }],
            },
          },
        },
      );
      expect(result).toBe(false);
    });

    it("returns true for matching message policies", () => {
      const provider = createProvider();
      const messagePolicies: ParsedSessionPolicies = {
        verified: false,
        messages: [
          {
            domain: {
              name: "TestDomain",
              version: "1",
              chainId: MOCK_CHAIN_ID,
            },
            types: {
              StarknetDomain: [
                { name: "name", type: "shortstring" },
                { name: "version", type: "shortstring" },
                { name: "chainId", type: "shortstring" },
              ],
              Message: [{ name: "content", type: "felt" }],
            },
            primaryType: "Message",
            authorized: true,
          },
        ],
      };

      const result = callValidate(provider, messagePolicies, messagePolicies);
      expect(result).toBe(true);
    });

    it("returns false when message is missing from stored policies", () => {
      const provider = createProvider();
      const result = callValidate(
        provider,
        {
          verified: false,
          messages: [
            {
              domain: {
                name: "TestDomain",
                version: "1",
                chainId: MOCK_CHAIN_ID,
              },
              types: {
                StarknetDomain: [
                  { name: "name", type: "shortstring" },
                  { name: "version", type: "shortstring" },
                  { name: "chainId", type: "shortstring" },
                ],
                Message: [{ name: "content", type: "felt" }],
              },
              primaryType: "Message",
              authorized: true,
            },
          ],
        },
        { verified: false },
      );
      expect(result).toBe(false);
    });

    it("returns true when new policies have no contracts or messages", () => {
      const provider = createProvider();
      const result = callValidate(
        provider,
        { verified: false },
        VALID_POLICIES,
      );
      expect(result).toBe(true);
    });

    it("returns false when new has contracts but stored has none", () => {
      const provider = createProvider();
      const result = callValidate(provider, VALID_POLICIES, {
        verified: false,
      });
      expect(result).toBe(false);
    });

    it("does exact address matching (no normalization)", () => {
      const provider = createProvider();
      const result = callValidate(
        provider,
        {
          verified: false,
          contracts: {
            "0xABC": {
              methods: [{ entrypoint: "attack", authorized: true }],
            },
          },
        },
        {
          verified: false,
          contracts: {
            "0xabc": {
              methods: [{ entrypoint: "attack", authorized: true }],
            },
          },
        },
      );
      // Different casing = different key = not found
      expect(result).toBe(false);
    });
  });

  // ==========================================
  // ingestSessionFromRedirect
  // ==========================================

  describe("ingestSessionFromRedirect", () => {
    it("decodes valid base64 session and stores to localStorage", () => {
      const provider = createProvider();
      const encoded = (global as any).btoa(JSON.stringify(VALID_SESSION));

      const result = (provider as any).ingestSessionFromRedirect(encoded);

      expect(result).toBeDefined();
      expect(result.username).toBe("testuser");
      expect(result.address).toBe("0xabc");

      const stored = JSON.parse(mockLocalStorage.getItem("session")!);
      expect(stored.username).toBe("testuser");
    });

    it("pads base64 correctly when padding is stripped", () => {
      const provider = createProvider();
      const encoded = (global as any)
        .btoa(JSON.stringify(VALID_SESSION))
        .replace(/=+$/, "");

      const result = (provider as any).ingestSessionFromRedirect(encoded);
      expect(result).toBeDefined();
      expect(result.username).toBe("testuser");
    });

    it("returns undefined for malformed payloads without throwing", () => {
      const provider = createProvider();
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = (provider as any).ingestSessionFromRedirect(
        "not-valid-base64!!!",
      );
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it("returns undefined when required fields are missing", () => {
      const provider = createProvider();
      const incomplete = { username: "test" };
      const encoded = (global as any).btoa(JSON.stringify(incomplete));

      const result = (provider as any).ingestSessionFromRedirect(encoded);
      expect(result).toBeUndefined();
    });

    it("fills default guardianKeyGuid and metadataHash", () => {
      const provider = createProvider();
      const sessionWithoutDefaults = {
        username: "testuser",
        address: "0xabc",
        ownerGuid: "0xowner",
        expiresAt: String(Math.floor(Date.now() / 1000) + 3600),
      };
      const encoded = (global as any).btoa(
        JSON.stringify(sessionWithoutDefaults),
      );

      const result = (provider as any).ingestSessionFromRedirect(encoded);

      expect(result.guardianKeyGuid).toBe("0x0");
      expect(result.metadataHash).toBe("0x0");
    });
  });

  // ==========================================
  // disconnect
  // ==========================================

  describe("disconnect", () => {
    it("removes only session keys from localStorage", async () => {
      (global as any).window.open = jest.fn(() => null);

      const provider = createProvider();
      mockLocalStorage.setItem("session", JSON.stringify(VALID_SESSION));
      mockLocalStorage.setItem(
        "sessionPolicies",
        JSON.stringify(VALID_POLICIES),
      );
      mockLocalStorage.setItem("lastUsedConnector", "controller_session");
      mockLocalStorage.setItem("unrelatedKey", "keep");

      await provider.disconnect();

      expect(mockLocalStorage.getItem("sessionSigner")).toBeNull();
      expect(mockLocalStorage.getItem("session")).toBeNull();
      expect(mockLocalStorage.getItem("sessionPolicies")).toBeNull();
      expect(mockLocalStorage.getItem("lastUsedConnector")).toBeNull();
      expect(mockLocalStorage.getItem("unrelatedKey")).toBe("keep");
    });
  });
});
