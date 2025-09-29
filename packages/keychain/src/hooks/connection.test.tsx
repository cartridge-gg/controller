import { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { defaultTheme } from "@cartridge/presets";
import { isOriginVerified, useConnectionValue } from "./connection";

const loadConfigMock = vi.fn();
const useThemeEffectMock = vi.fn();

vi.mock("@cartridge/presets", async () => {
  const actual =
    await vi.importActual<typeof import("@cartridge/presets")>(
      "@cartridge/presets",
    );

  return {
    ...actual,
    loadConfig: loadConfigMock,
  };
});

vi.mock("@cartridge/ui", async () => {
  const actual =
    await vi.importActual<typeof import("@cartridge/ui")>("@cartridge/ui");

  return {
    ...actual,
    useThemeEffect: useThemeEffectMock,
  };
});

vi.mock("@cartridge/ui/utils", async () => {
  const actual = await vi.importActual<typeof import("@cartridge/ui/utils")>(
    "@cartridge/ui/utils",
  );

  return {
    ...actual,
    isIframe: () => true,
    normalizeOrigin: (origin: string) => origin,
  };
});

vi.mock("@/components/connect/create/utils", () => ({
  fetchController: vi.fn(() => Promise.resolve({ controller: null })),
}));

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

declare global {
  // Extend window used within tests without importing app-level types
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    controller?: {
      rpcUrl: () => string;
      chainId: () => string;
      disconnect: () => Promise<void> | void;
      username: () => string | undefined;
    };
    keychain_wallets?: unknown;
  }
}

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

describe("useConnectionValue", () => {
  const createWrapper = (entry: string) =>
    function Wrapper({ children }: { children: ReactNode }) {
      return <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>;
    };

  beforeEach(() => {
    loadConfigMock.mockReset();
    useThemeEffectMock.mockReset();
    useThemeEffectMock.mockImplementation(() => undefined);
    mockGetChainId.mockReset();
    mockGetChainId.mockResolvedValue("0x1");

    window.controller = {
      rpcUrl: () => "https://rpc.example.com",
      chainId: () => "0x534e5f534550",
      disconnect: () => Promise.resolve(),
      username: () => undefined,
    };
    window.keychain_wallets = undefined;
  });

  it("keeps the default theme when no preset is provided", async () => {
    const { result } = renderHook(() => useConnectionValue(), {
      wrapper: createWrapper("/connect"),
    });

    await waitFor(() => expect(useThemeEffectMock).toHaveBeenCalled());

    expect(loadConfigMock).not.toHaveBeenCalled();
    expect(result.current.theme.name).toBe(defaultTheme.name);
    expect(result.current.theme.verified).toBe(true);
    expect(result.current.verified).toBe(false);

    const lastCall = useThemeEffectMock.mock.calls.at(-1)?.[0];
    expect(lastCall?.theme.name).toBe(defaultTheme.name);
    expect(lastCall?.theme.verified).toBe(true);
  });

  it("applies the preset theme when config resolves", async () => {
    loadConfigMock.mockResolvedValue({
      origin: ["test.com"],
      theme: { ...defaultTheme, name: "Test Theme" },
    });

    const { result } = renderHook(() => useConnectionValue(), {
      wrapper: createWrapper("/connect?preset=test"),
    });

    await waitFor(() => {
      expect(loadConfigMock).toHaveBeenCalledWith("test");
      expect(result.current.theme.name).toBe("Test Theme");
      expect(result.current.verified).toBe(true);
    });

    const lastCall = useThemeEffectMock.mock.calls.at(-1)?.[0];
    expect(lastCall?.theme.name).toBe("Test Theme");
    expect(lastCall?.theme.verified).toBe(true);
  });

  it("falls back to the default theme when config lacks a theme", async () => {
    loadConfigMock.mockResolvedValue({
      origin: ["test.com"],
    });

    const { result } = renderHook(() => useConnectionValue(), {
      wrapper: createWrapper("/connect?preset=test"),
    });

    await waitFor(() => {
      expect(loadConfigMock).toHaveBeenCalledWith("test");
      expect(result.current.verified).toBe(true);
      expect(result.current.theme.name).toBe(defaultTheme.name);
    });

    const lastCall = useThemeEffectMock.mock.calls.at(-1)?.[0];
    expect(lastCall?.theme.name).toBe(defaultTheme.name);
    expect(lastCall?.theme.verified).toBe(true);
  });

  it("marks the preset as unverified when config loading fails", async () => {
    loadConfigMock.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useConnectionValue(), {
      wrapper: createWrapper("/connect?preset=test"),
    });

    await waitFor(() => expect(loadConfigMock).toHaveBeenCalledWith("test"));

    await waitFor(() => {
      expect(result.current.verified).toBe(false);
      expect(result.current.theme.name).toBe(defaultTheme.name);
    });

    const lastCall = useThemeEffectMock.mock.calls.at(-1)?.[0];
    expect(lastCall?.theme.name).toBe(defaultTheme.name);
    expect(lastCall?.theme.verified).toBe(true);
  });
});
