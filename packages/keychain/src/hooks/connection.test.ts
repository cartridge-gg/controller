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
vi.mock("@/utils/connection", () => ({
  connectToController: vi.fn(() => ({
    promise: Promise.resolve({
      origin: "https://test.com",
    }),
    destroy: vi.fn(),
  })),
}));
