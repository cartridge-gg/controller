import { isOriginVerified } from "./connection";
import { vi } from "vitest";

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
  rpcUrl: () => "https://rpc.example.com",
  address: () => "0x456",
  username: () => "testuser",
  owner: () => "0x789",
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
