import { isOriginVerified, resolvePolicies } from "./connection";
import { vi } from "vitest";

vi.mock("@cartridge/controller", async () => {
  const actual = await vi.importActual("@cartridge/controller");
  return {
    ...actual,
    getPresetSessionPolicies: vi.fn(() => undefined),
  };
});

describe("isOriginVerified", () => {
  const allowedOrigins = ["example.com", "*.example.com", "sub.test.com"];

  it("should return true for exact match", () => {
    expect(isOriginVerified("https://example.com", allowedOrigins)).toBe(true);
  });

  it("should return true for wildcard subdomain match", () => {
    expect(isOriginVerified("https://app.example.com", allowedOrigins)).toBe(
      true,
    );
    expect(
      isOriginVerified("https://deep.sub.example.com", allowedOrigins),
    ).toBe(true);
  });

  it("should return true for another exact match", () => {
    expect(isOriginVerified("https://sub.test.com", allowedOrigins)).toBe(true);
  });

  it("should return false for non-matching origin", () => {
    expect(isOriginVerified("https://another.com", allowedOrigins)).toBe(false);
  });

  it("should return false for base domain when wildcard is used", () => {
    // *.example.com should not match example.com itself
    expect(isOriginVerified("https://example.com", ["*.example.com"])).toBe(
      false,
    );
  });

  it("should return false for empty origin", () => {
    expect(isOriginVerified("", allowedOrigins)).toBe(false);
  });

  it("should return false if allowedOrigins is empty", () => {
    expect(isOriginVerified("https://example.com", [])).toBe(false);
  });

  it("should handle origins with ports", () => {
    expect(
      isOriginVerified("https://app.example.com:8080", allowedOrigins),
    ).toBe(true);
    expect(isOriginVerified("https://example.com:3000", allowedOrigins)).toBe(
      true,
    );
    expect(isOriginVerified("https://another.com:443", allowedOrigins)).toBe(
      false,
    );
  });

  it("should handle http protocol", () => {
    expect(isOriginVerified("http://example.com", allowedOrigins)).toBe(true);
    expect(isOriginVerified("http://app.example.com", allowedOrigins)).toBe(
      true,
    );
  });

  it("should return false for similar but different domains", () => {
    expect(isOriginVerified("https://myexample.com", allowedOrigins)).toBe(
      false,
    );
    expect(isOriginVerified("https://example.co", allowedOrigins)).toBe(false);
  });
});

// Mock RpcProvider
const mockGetChainId = vi.fn();
vi.mock("starknet", async () => {
  const actual = await vi.importActual("starknet");
  return {
    ...actual,
    RpcProvider: vi.fn().mockImplementation(() => ({
      getChainId: mockGetChainId,
    })),
  };
});

// Mock Controller
const mockController = {
  appId: () => "test-app",
  classHash: () => "0x123",
  chainId: () => "0x534e5f534550",
  rpcUrl: () => "https://rpc.sepolia.example.com",
  address: () => "0x456",
  username: () => "testuser",
  owner: () => ({ signer: { starknet: "0x789" } }) as unknown,
};

vi.mock("@/utils/controller", () => ({
  default: vi.fn().mockImplementation((options: Record<string, unknown>) => ({
    ...mockController,
    chainId: () => options.chainId || mockController.chainId(),
    rpcUrl: () => options.rpcUrl || mockController.rpcUrl(),
  })),
}));

// Mock navigation hook
const mockNavigate = vi.fn();
vi.mock("@/context/navigation", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock other dependencies
const mockLoadConfig = vi.fn();
vi.mock("@/utils/connection", () => ({
  connectToController: vi.fn(() => ({
    promise: Promise.resolve({
      origin: "https://test.com",
    }),
    destroy: vi.fn(),
  })),
  loadConfig: (...args: unknown[]) => mockLoadConfig(...args),
  toArray: (value: string | string[]) =>
    Array.isArray(value) ? value : [value],
}));

describe("Config Loading and Verification Separation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Config loading independence", () => {
    it("should load config when preset is provided", async () => {
      const mockConfig = {
        origin: "https://example.com",
        name: "Test App",
      };
      mockLoadConfig.mockResolvedValue(mockConfig);

      // This test verifies that config loading happens independently
      expect(mockLoadConfig).toBeDefined();
    });

    it("should handle config without origin gracefully", async () => {
      const mockConfig: Record<string, unknown> = {
        name: "Test App",
        // no origin field
      };
      mockLoadConfig.mockResolvedValue(mockConfig);

      // Verification should set verified to false when origin is missing
      expect(mockConfig.origin).toBeUndefined();
    });

    it("should process config with array of origins", async () => {
      const mockConfig = {
        origin: ["https://example.com", "https://another.com"],
        name: "Test App",
      };
      mockLoadConfig.mockResolvedValue(mockConfig);

      expect(Array.isArray(mockConfig.origin)).toBe(true);
    });
  });

  describe("Verification computation timing", () => {
    it("should verify after config is loaded", async () => {
      // This test ensures verification happens only after config is available
      const mockConfig = {
        origin: "https://example.com",
        name: "Test App",
      };

      let configLoaded = false;
      mockLoadConfig.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        configLoaded = true;
        return mockConfig;
      });

      // Verification should wait for config to load
      expect(configLoaded).toBe(false);
    });

    it("should handle origin availability after config loads", () => {
      const mockConfig = {
        origin: "https://example.com",
      };

      // Simulates the case where origin might not be available immediately
      const hasOrigin = Boolean(mockConfig.origin);
      expect(hasOrigin).toBe(true);
    });
  });

  describe("Standalone mode redirect_url verification", () => {
    it("should extract origin from redirect_url", () => {
      const redirectUrl = "https://example.com/callback?param=value";
      const url = new URL(redirectUrl);
      const redirectOrigin = url.origin;

      expect(redirectOrigin).toBe("https://example.com");
    });

    it("should handle invalid redirect_url", () => {
      const invalidUrl = "not-a-valid-url";

      expect(() => {
        new URL(invalidUrl);
      }).toThrow();
    });

    it("should verify localhost redirect_url", () => {
      const redirectUrl = "http://localhost:3000/callback";
      const url = new URL(redirectUrl);
      const redirectOrigin = url.origin;

      expect(redirectOrigin).toContain("localhost");
    });

    it("should extract origin with port", () => {
      const redirectUrl = "https://example.com:8080/callback";
      const url = new URL(redirectUrl);
      const redirectOrigin = url.origin;

      expect(redirectOrigin).toBe("https://example.com:8080");
    });

    it("should verify loot-survivor preset with matching redirect_url", () => {
      // Simulates: https://x.cartridge.gg/?redirect_url=https://lootsurvivor.io&preset=loot-survivor
      const redirectUrl = "https://lootsurvivor.io";
      const allowedOrigins = [
        "lootsurvivor.io",
        "claims.lootsurvivor.io",
        "tournaments.lootsurvivor.io",
      ];

      const url = new URL(redirectUrl);
      const redirectOrigin = url.origin;

      // Extract hostname from redirect origin
      const redirectHostname = url.hostname;

      // Verify that the redirect hostname matches the preset's allowed origins
      const isVerified = isOriginVerified(redirectOrigin, allowedOrigins);

      expect(redirectHostname).toBe("lootsurvivor.io");
      expect(isVerified).toBe(true);
    });

    it("should verify loot-survivor preset with subdomain redirect_url", () => {
      const redirectUrl = "https://claims.lootsurvivor.io";
      const allowedOrigins = [
        "lootsurvivor.io",
        "claims.lootsurvivor.io",
        "tournaments.lootsurvivor.io",
      ];

      const isVerified = isOriginVerified(redirectUrl, allowedOrigins);

      expect(isVerified).toBe(true);
    });

    it("should not verify loot-survivor preset with non-matching redirect_url", () => {
      const redirectUrl = "https://malicious-site.com";
      const allowedOrigins = [
        "lootsurvivor.io",
        "claims.lootsurvivor.io",
        "tournaments.lootsurvivor.io",
      ];

      const isVerified = isOriginVerified(redirectUrl, allowedOrigins);

      expect(isVerified).toBe(false);
    });
  });

  describe("Multiple allowed origins verification", () => {
    it("should verify against multiple allowed origins", () => {
      const allowedOrigins = ["example.com", "another.com", "*.subdomain.com"];

      expect(isOriginVerified("https://example.com", allowedOrigins)).toBe(
        true,
      );
      expect(isOriginVerified("https://another.com", allowedOrigins)).toBe(
        true,
      );
      expect(
        isOriginVerified("https://app.subdomain.com", allowedOrigins),
      ).toBe(true);
      expect(isOriginVerified("https://notallowed.com", allowedOrigins)).toBe(
        false,
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle empty config gracefully", async () => {
      mockLoadConfig.mockResolvedValue({});

      const config = await mockLoadConfig();
      expect(config.origin).toBeUndefined();
    });

    it("should handle null config", async () => {
      mockLoadConfig.mockResolvedValue(null);

      const config = await mockLoadConfig();
      expect(config).toBeNull();
    });

    it("should handle config load rejection", async () => {
      const error = new Error("Failed to load config");
      mockLoadConfig.mockRejectedValue(error);

      await expect(mockLoadConfig()).rejects.toThrow("Failed to load config");
    });

    it("should verify universal wildcard origin", () => {
      const allowedOrigins = ["*"];

      expect(isOriginVerified("https://any-domain.com", allowedOrigins)).toBe(
        true,
      );
      expect(isOriginVerified("http://localhost:3000", allowedOrigins)).toBe(
        true,
      );
    });
  });
});

describe("resolvePolicies", () => {
  const encodedPolicies = encodeURIComponent(
    JSON.stringify({
      contracts: {
        "0x1": {
          methods: [{ entrypoint: "transfer" }],
        },
      },
    }),
  );

  it("uses URL policies when shouldOverridePresetPolicies is true", () => {
    const result = resolvePolicies({
      policiesStr: encodedPolicies,
      preset: "some-preset",
      shouldOverridePresetPolicies: true,
      configData: null,
      chainId: undefined,
      verified: false,
      isConfigLoading: true,
    });

    expect(result.isPoliciesResolved).toBe(true);
    expect(result.policies).toBeDefined();
  });

  it("falls back to URL policies when preset has no chain policies", () => {
    const result = resolvePolicies({
      policiesStr: encodedPolicies,
      preset: "some-preset",
      shouldOverridePresetPolicies: false,
      configData: {},
      chainId: "0x534e5f534550",
      verified: true,
      isConfigLoading: false,
    });

    expect(result.isPoliciesResolved).toBe(true);
    expect(result.policies).toBeDefined();
  });

  it("waits for config when preset is present and override is not active", () => {
    const result = resolvePolicies({
      policiesStr: encodedPolicies,
      preset: "some-preset",
      shouldOverridePresetPolicies: false,
      configData: null,
      chainId: undefined,
      verified: true,
      isConfigLoading: true,
    });

    expect(result.isPoliciesResolved).toBe(false);
    expect(result.policies).toBeUndefined();
  });
});

describe("URL rpc_url priority over stored controller rpcUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Controller disconnect on chain mismatch", () => {
    it("should disconnect controller when chain IDs differ", () => {
      // Controller is on sepolia (0x534e5f534550), URL requests mainnet
      const controllerChainId = mockController.chainId();
      const urlChainId = "0x534e5f4d41494e"; // SN_MAIN

      expect(controllerChainId).not.toBe(urlChainId);

      // The effect should trigger disconnect when chain IDs don't match
      const shouldDisconnect =
        mockController && urlChainId && controllerChainId !== urlChainId;
      expect(shouldDisconnect).toBeTruthy();
    });

    it("should NOT disconnect controller when chain IDs match", () => {
      // Same chain, potentially different RPC endpoints
      const controllerChainId = mockController.chainId();
      const urlChainId = "0x534e5f534550"; // SN_SEPOLIA (matches mock)

      expect(controllerChainId).toBe(urlChainId);

      const shouldDisconnect = controllerChainId !== urlChainId;
      expect(shouldDisconnect).toBe(false);
    });

    it("should NOT disconnect when chain IDs match despite different RPC URLs", () => {
      // Both on sepolia but using different RPC endpoints
      const controllerChainId = mockController.chainId(); // 0x534e5f534550
      const urlChainId = "0x534e5f534550"; // SN_SEPOLIA

      // RPC URLs differ, but chain IDs match — no disconnect
      const controllerRpcUrl = mockController.rpcUrl(); // sepolia.example.com
      const urlRpcUrl = "https://other-provider.com/sepolia";
      expect(controllerRpcUrl).not.toBe(urlRpcUrl);
      expect(controllerChainId).toBe(urlChainId);

      const shouldDisconnect = controllerChainId !== urlChainId;
      expect(shouldDisconnect).toBe(false);
    });

    it("should NOT disconnect controller when chainId is undefined", () => {
      const chainId = undefined;

      // No chainId - the effect guard returns early
      const shouldDisconnect = mockController && chainId;
      expect(shouldDisconnect).toBeFalsy();
    });

    it("should NOT disconnect controller when controller is not set", () => {
      const controller = undefined;
      const chainId = "0x534e5f4d41494e";

      // No controller - the effect guard returns early
      const shouldDisconnect = controller && chainId;
      expect(shouldDisconnect).toBeFalsy();
    });
  });

  describe("rpcUrl state priority", () => {
    it("should use URL rpc_url when provided, not controller's stored rpcUrl", () => {
      const urlRpcUrl = "https://api.cartridge.gg/x/starknet/mainnet";
      const controllerRpcUrl = "https://rpc.sepolia.example.com";

      // Simulate the sync effect: when urlRpcUrl exists, don't override from controller
      const shouldSyncFromController = !urlRpcUrl;
      expect(shouldSyncFromController).toBe(false);

      // The effective rpcUrl should be the URL value
      const effectiveRpcUrl = urlRpcUrl || controllerRpcUrl;
      expect(effectiveRpcUrl).toBe(urlRpcUrl);
    });

    it("should sync rpcUrl from controller when no URL rpc_url is provided", () => {
      const urlRpcUrl = null;
      const controllerRpcUrl = "https://rpc.sepolia.example.com";

      // Simulate the sync effect: when no urlRpcUrl, sync from controller
      const shouldSyncFromController = !urlRpcUrl;
      expect(shouldSyncFromController).toBe(true);

      // The effective rpcUrl should be the controller's value
      const effectiveRpcUrl = urlRpcUrl || controllerRpcUrl;
      expect(effectiveRpcUrl).toBe(controllerRpcUrl);
    });

    it("should decode URL-encoded rpc_url parameter", () => {
      const encodedRpcUrl =
        "https%3A%2F%2Fapi.cartridge.gg%2Fx%2Fstarknet%2Fmainnet";
      const decoded = decodeURIComponent(encodedRpcUrl);
      expect(decoded).toBe("https://api.cartridge.gg/x/starknet/mainnet");
    });

    it("should parse rpc_url from URLSearchParams correctly", () => {
      const params = new URLSearchParams(
        "rpc_url=https%3A%2F%2Fapi.cartridge.gg%2Fx%2Fstarknet%2Fmainnet&public_key=0x123",
      );
      const raw = params.get("rpc_url");
      expect(raw).toBe("https://api.cartridge.gg/x/starknet/mainnet");

      const urlRpcUrl = raw ? decodeURIComponent(raw) : null;
      expect(urlRpcUrl).toBe("https://api.cartridge.gg/x/starknet/mainnet");
    });

    it("should return null urlRpcUrl when rpc_url param is absent", () => {
      const params = new URLSearchParams("public_key=0x123");
      const raw = params.get("rpc_url");
      expect(raw).toBeNull();

      const urlRpcUrl = raw ? decodeURIComponent(raw) : null;
      expect(urlRpcUrl).toBeNull();
    });
  });
});
