import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { ConnectRoute } from "./ConnectRoute";
import { renderWithProviders } from "@/test/mocks/providers";
import { ResponseCodes } from "@cartridge/controller";

// Mock dependencies
const mockSafeRedirect = vi.fn();
vi.mock("@/utils/url-validator", () => ({
  safeRedirect: (...args: unknown[]) => mockSafeRedirect(...args),
}));

const mockIsIframe = vi.fn();
vi.mock("@cartridge/ui/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@cartridge/ui/utils")>();
  return {
    ...actual,
    isIframe: () => mockIsIframe(),
    fetchDataCreator: vi.fn(() => vi.fn()),
  };
});

const mockController = {
  username: vi.fn().mockReturnValue("testuser"),
  address: vi.fn().mockReturnValue("0x123456789abcdef"),
  createSession: vi.fn().mockResolvedValue(undefined),
};

const mockUseConnection = vi.fn();
vi.mock("@/hooks/connection", () => ({
  useConnection: () => mockUseConnection(),
}));

const mockCleanupCallbacks = vi.fn();
vi.mock("@/utils/connection/callbacks", () => ({
  cleanupCallbacks: (...args: unknown[]) => mockCleanupCallbacks(...args),
}));

const mockParseConnectParams = vi.fn();
vi.mock("@/utils/connection/connect", () => ({
  parseConnectParams: (...args: unknown[]) => mockParseConnectParams(...args),
}));

const mockUseRouteParams = vi.fn();
const mockUseRouteCompletion = vi.fn();
const mockUseRouteCallbacks = vi.fn();
vi.mock("@/hooks/route", () => ({
  useRouteParams: (fn: (params: URLSearchParams) => unknown) => {
    const result = mockUseRouteParams();
    if (result) {
      fn(new URLSearchParams(window.location.search));
    }
    return result;
  },
  useRouteCompletion: () => mockUseRouteCompletion(),
  useRouteCallbacks: (...args: unknown[]) => mockUseRouteCallbacks(...args),
}));

// Mock window.location
const mockLocation = {
  search: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("ConnectRoute", () => {
  const mockParams = {
    resolve: vi.fn(),
    reject: vi.fn(),
    params: { id: "test-id" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsIframe.mockReturnValue(true); // Default to embedded mode
    mockUseRouteParams.mockReturnValue(mockParams);
    mockUseRouteCompletion.mockReturnValue(vi.fn());
    mockLocation.search = "";

    mockUseConnection.mockReturnValue({
      controller: mockController,
      policies: null,
      verified: true,
      theme: {
        name: "TestApp",
        verified: true,
      },
      isNewUser: false,
      authMethod: undefined,
      showSuccessScreen: false,
      setShowSuccessScreen: vi.fn(),
      setIsNewUser: vi.fn(),
      setAuthMethod: vi.fn(),
    });
  });

  describe("Embedded mode (iframe)", () => {
    beforeEach(() => {
      mockIsIframe.mockReturnValue(true);
    });

    it("auto-connects when no policies exist", async () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: null,
        verified: true,
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      await waitFor(() => {
        expect(mockParams.resolve).toHaveBeenCalledWith({
          code: ResponseCodes.SUCCESS,
          address: "0x123456789abcdef",
        });
        expect(mockCleanupCallbacks).toHaveBeenCalledWith("test-id");
      });
    });

    it("auto-creates session for verified policies", async () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: {
          verified: true,
          contracts: {},
          messages: [],
        },
        verified: true,
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      await waitFor(() => {
        expect(mockController.createSession).toHaveBeenCalled();
        expect(mockParams.resolve).toHaveBeenCalledWith({
          code: ResponseCodes.SUCCESS,
          address: "0x123456789abcdef",
        });
      });
    });

    it("shows UI for unverified policies", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: {
          verified: false,
          contracts: {
            "0xcontract": {
              methods: [{ entrypoint: "transfer", authorized: true }],
            },
          },
          messages: [],
        },
        verified: false,
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      // Should render CreateSession component
      expect(screen.getByText("Create Session")).toBeInTheDocument();
    });

    it("does not show UI for verified policies without approvals", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: {
          verified: true,
          contracts: {},
          messages: [],
        },
        verified: true,
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      expect(screen.queryByText("Create Session")).toBeNull();
      expect(screen.queryByText("Spending Limit")).toBeNull();
    });

    it("shows spending limit page for verified policies with approvals", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: {
          verified: true,
          contracts: {
            "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7":
              {
                methods: [
                  {
                    entrypoint: "approve",
                    spender:
                      "0x1234567890123456789012345678901234567890123456789012345678901234",
                    amount: "1000",
                  },
                ],
              },
          },
          messages: [],
        },
        verified: true,
        theme: {
          name: "TestApp",
          verified: true,
        },
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      expect(screen.getByText("Spending Limit")).toBeInTheDocument();
      expect(mockController.createSession).not.toHaveBeenCalled();
    });
  });

  describe("Standalone mode (not iframe)", () => {
    beforeEach(() => {
      mockIsIframe.mockReturnValue(false);
      mockLocation.search = "?redirect_url=https://example.com/callback";
    });

    it("shows StandaloneConnect for verified session with redirect_url", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: null,
        verified: true,
        theme: {
          name: "TestApp",
          verified: true,
        },
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      expect(screen.getByText("Connect")).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    it("shows StandaloneConnect for verified policies with redirect_url", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: {
          verified: true,
          contracts: {},
          messages: [],
        },
        verified: true,
        theme: {
          name: "TestApp",
          verified: true,
        },
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      expect(screen.getByText("Connect")).toBeInTheDocument();
    });

    it("shows CreateSession for unverified policies with redirect_url", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: {
          verified: false,
          contracts: {
            "0xcontract": {
              methods: [{ entrypoint: "transfer", authorized: true }],
            },
          },
          messages: [],
        },
        verified: false,
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      expect(screen.getByText("Create Session")).toBeInTheDocument();
    });

    it("shows unverified warning in StandaloneConnect", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: null,
        verified: false,
        theme: {
          name: "TestApp",
          verified: false,
        },
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      expect(
        screen.getByText(/This application is not verified/),
      ).toBeInTheDocument();
    });

    it("auto-connects when no redirect_url present", async () => {
      mockLocation.search = "";
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: null,
        verified: true,
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      await waitFor(() => {
        expect(mockParams.resolve).toHaveBeenCalledWith({
          code: ResponseCodes.SUCCESS,
          address: "0x123456789abcdef",
        });
      });
    });
  });

  describe("Error handling", () => {
    it("handles session creation failure", async () => {
      mockIsIframe.mockReturnValue(true);
      const error = new Error("Session creation failed");
      mockController.createSession.mockRejectedValueOnce(error);

      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: {
          verified: true,
          contracts: {},
          messages: [],
        },
        verified: true,
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      await waitFor(() => {
        expect(mockParams.reject).toHaveBeenCalledWith(error);
      });
    });

    it("returns null when controller is not available", () => {
      mockUseConnection.mockReturnValue({
        controller: null,
        policies: null,
        verified: false,
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      const { container } = renderWithProviders(<ConnectRoute />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Redirect behavior", () => {
    it("redirects on connect in standalone mode", async () => {
      mockIsIframe.mockReturnValue(false);
      mockLocation.search = "?redirect_url=https://example.com/callback";

      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: null,
        verified: true,
        theme: {
          name: "TestApp",
          verified: true,
        },
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      const connectButton = screen.getByText("Connect");
      connectButton.click();

      await waitFor(() => {
        expect(mockSafeRedirect).toHaveBeenCalledWith(
          "https://example.com/callback",
          true,
        );
      });
    });

    it("calls handleCompletion in embedded mode", async () => {
      mockIsIframe.mockReturnValue(true);
      const mockHandleCompletion = vi.fn();
      mockUseRouteCompletion.mockReturnValue(mockHandleCompletion);

      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: null,
        verified: true,
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      await waitFor(() => {
        expect(mockHandleCompletion).toHaveBeenCalled();
        expect(mockSafeRedirect).not.toHaveBeenCalled();
      });
    });
  });

  describe("Policy processing", () => {
    it("processes policies correctly for verified sessions", async () => {
      mockIsIframe.mockReturnValue(true);
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: {
          verified: true,
          contracts: {
            "0xcontract": {
              methods: [{ id: "1", name: "transfer", authorized: true }],
            },
          },
          messages: [{ id: "3", content: "Sign this", authorized: true }],
        },
        verified: true,
        isNewUser: false,
        authMethod: undefined,
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      await waitFor(() => {
        expect(mockController.createSession).toHaveBeenCalled();
        const callArgs = mockController.createSession.mock.calls[0];
        const policies = callArgs[1];

        // Verify id fields are removed
        expect(policies.contracts["0xcontract"].methods[0]).not.toHaveProperty(
          "id",
        );
        expect(policies.messages[0]).not.toHaveProperty("id");
      });
    });
  });

  describe("Success screen", () => {
    it("shows success screen when showSuccessScreen is true in context", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: null,
        verified: true,
        isNewUser: true,
        authMethod: "webauthn",
        showSuccessScreen: true,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      // Should show ConnectionSuccess component
      expect(screen.getByText(/Success!/i)).toBeInTheDocument();
    });

    it("hides success screen after timeout", async () => {
      vi.useFakeTimers();

      const mockSetShowSuccessScreen = vi.fn();

      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: null,
        verified: true,
        isNewUser: false,
        authMethod: "webauthn",
        showSuccessScreen: true,
        setShowSuccessScreen: mockSetShowSuccessScreen,
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      // Should show success screen initially
      expect(screen.getByText(/Success!/i)).toBeInTheDocument();

      // Fast-forward time by 1 second (the timeout duration)
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        // setShowSuccessScreen should be called with false to hide it
        expect(mockSetShowSuccessScreen).toHaveBeenCalledWith(false);
      });

      vi.useRealTimers();
    });

    it("does not show success screen when controller is not available", () => {
      mockUseConnection.mockReturnValue({
        controller: null,
        policies: null,
        verified: false,
        isNewUser: true,
        authMethod: "webauthn",
        showSuccessScreen: true,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      const { container } = renderWithProviders(<ConnectRoute />);

      // Should return null when controller is not available
      expect(container.firstChild).toBeNull();
    });

    it("does not show success screen when showSuccessScreen is false", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: null,
        verified: true,
        isNewUser: true,
        authMethod: "webauthn",
        showSuccessScreen: false,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      // Should NOT show success screen
      expect(screen.queryByText(/Success!/i)).not.toBeInTheDocument();
    });

    it("prevents auto-connect when showing success screen", () => {
      mockUseConnection.mockReturnValue({
        controller: mockController,
        policies: null,
        verified: true,
        isNewUser: true,
        authMethod: "webauthn",
        showSuccessScreen: true,
        setShowSuccessScreen: vi.fn(),
        setIsNewUser: vi.fn(),
        setAuthMethod: vi.fn(),
      });

      renderWithProviders(<ConnectRoute />);

      // Should show success screen
      expect(screen.getByText(/Success!/i)).toBeInTheDocument();

      // Should NOT auto-connect while showing success screen
      expect(mockParams.resolve).not.toHaveBeenCalled();
    });
  });
});
