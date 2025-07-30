import { isOriginVerified, useConnectionValue } from "./connection";
import { renderHook, waitFor } from "@testing-library/react";
import { vi, beforeEach, afterEach } from "vitest";

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
    RpcProvider: class MockRpcProvider {
      constructor() {}
      getChainId = mockGetChainId;
    },
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
  default: class MockController {
    constructor(options: any) {
      return {
        ...mockController,
        chainId: () => options.chainId || mockController.chainId(),
        rpcUrl: () => options.rpcUrl || mockController.rpcUrl(),
      };
    }
  },
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

describe("useConnectionValue - rpcUrl handling", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetChainId.mockResolvedValue("0x534e5f534550");

    // Mock window.location
    global.window = {
      ...originalWindow,
      location: {
        ...originalWindow.location,
        search: "",
        pathname: "/",
        origin: "https://test.com",
      },
      controller: mockController as any,
    } as any;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("should fetch chainId from RPC when rpcUrl is provided", async () => {
    global.window.location.search = "?rpc_url=https://custom-rpc.example.com";

    const { result } = renderHook(() => useConnectionValue());

    await waitFor(() => {
      expect(mockGetChainId).toHaveBeenCalled();
    });

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.chainId).toBe("0x534e5f534550");
    });
  });

  it("should create new controller when rpcUrl changes chainId", async () => {
    const newChainId = "0x534e5f4d41494e";
    mockGetChainId.mockResolvedValue(newChainId);

    global.window.location.search = "?rpc_url=https://mainnet-rpc.example.com";
    global.window.controller = mockController as any;

    const { result } = renderHook(() => useConnectionValue());

    await waitFor(() => {
      expect(mockGetChainId).toHaveBeenCalled();
    });

    // Wait for controller switch
    await waitFor(() => {
      expect(result.current.chainId).toBe(newChainId);
    });

    // Verify new controller was created and set
    expect(global.window.controller).toBeDefined();
  });

  it("should handle RPC error gracefully", async () => {
    mockGetChainId.mockRejectedValue(new Error("RPC connection failed"));

    global.window.location.search = "?rpc_url=https://invalid-rpc.example.com";

    const { result } = renderHook(() => useConnectionValue());

    await waitFor(() => {
      expect(mockGetChainId).toHaveBeenCalled();
    });

    // Should not crash and chainId should remain undefined
    expect(result.current.chainId).toBeUndefined();
  });

  it("should not create new controller if chainId matches existing", async () => {
    const existingChainId = "0x534e5f534550";
    mockGetChainId.mockResolvedValue(existingChainId);

    global.window.location.search =
      "?rpc_url=https://same-chain-rpc.example.com";
    global.window.controller = {
      ...mockController,
      chainId: () => existingChainId,
      rpcUrl: () => "https://same-chain-rpc.example.com",
    } as any;

    const originalController = global.window.controller;

    const { result } = renderHook(() => useConnectionValue());

    await waitFor(() => {
      expect(mockGetChainId).toHaveBeenCalled();
    });

    // Wait for effect to complete
    await waitFor(() => {
      expect(result.current.chainId).toBe(existingChainId);
    });

    // Controller should not have been replaced
    expect(global.window.controller).toBe(originalController);
  });

  it("should handle missing rpcUrl gracefully", async () => {
    global.window.location.search = "";

    const { result } = renderHook(() => useConnectionValue());

    // Should not call RPC when no rpcUrl
    expect(mockGetChainId).not.toHaveBeenCalled();
    expect(result.current.chainId).toBeUndefined();
  });

  it("should update rpcUrl state from URL params", async () => {
    const customRpcUrl = "https://custom-rpc.example.com";
    global.window.location.search = `?rpc_url=${encodeURIComponent(customRpcUrl)}`;

    const { result } = renderHook(() => useConnectionValue());

    // rpcUrl should be updated from URL params
    expect(result.current.rpcUrl).toBe(customRpcUrl);
  });
});
