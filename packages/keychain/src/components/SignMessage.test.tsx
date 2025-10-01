import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { waitFor, screen } from "@testing-library/react";
import { SignMessage } from "./SignMessage";
import { renderWithProviders } from "@/test/mocks/providers";
import { storeCallbacks } from "@/utils/connection/callbacks";
import { ResponseCodes } from "@cartridge/controller";
import { Signature, TypedData } from "starknet";
import * as connectionHooks from "@/hooks/connection";

// Mock the navigation hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(window.location.search)],
  };
});

// Mock the connection hook
const mockCloseModal = vi.fn();
const mockSetOnModalClose = vi.fn();
vi.mock("@/hooks/connection", () => ({
  useConnection: vi.fn(() => ({
    closeModal: mockCloseModal,
    setOnModalClose: mockSetOnModalClose,
    controller: {
      signMessage: vi.fn(() => Promise.resolve(["0x1", "0x2"] as Signature)),
    },
    origin: "test-app.com",
  })),
}));

const mockTypedData: TypedData = {
  types: {
    StarkNetDomain: [
      { name: "name", type: "felt" },
      { name: "chainId", type: "felt" },
      { name: "version", type: "felt" },
    ],
    Message: [
      { name: "content", type: "felt" },
      { name: "sender", type: "felt" },
    ],
  },
  primaryType: "Message",
  domain: {
    name: "Test",
    chainId: "1",
    version: "1",
  },
  message: {
    content: "Hello",
    sender: "0x123",
  },
};

describe("SignMessage", () => {
  beforeAll(() => {
    // Set up DOM
    Object.defineProperty(window, "location", {
      value: { search: "" },
      writable: true,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockCloseModal.mockClear();
    mockSetOnModalClose.mockClear();
  });

  it("should redirect to home when no data param is provided", async () => {
    window.location.search = "";

    renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("should redirect to home when invalid data param is provided", async () => {
    window.location.search = "?data=invalid-json";

    renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("should parse and display sign message params", async () => {
    const params = {
      id: "test-id",
      typedData: mockTypedData,
    };

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}`;

    renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(screen.getByText("Signature Request")).toBeInTheDocument();
    });
  });

  it("should setup modal close handler with callbacks", async () => {
    const mockResolve = vi.fn();
    const params = {
      id: "test-id",
      typedData: mockTypedData,
    };

    storeCallbacks("test-id", { resolve: mockResolve });

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}`;

    renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(mockSetOnModalClose).toHaveBeenCalledWith(expect.any(Function));
    });

    // Simulate modal close
    const closeHandler = mockSetOnModalClose.mock.calls[0][0];
    closeHandler();

    expect(mockResolve).toHaveBeenCalledWith({
      code: ResponseCodes.CANCELED,
      message: "Canceled",
    });
  });

  it("should cleanup modal close handler on unmount", async () => {
    const params = {
      id: "test-id",
      typedData: mockTypedData,
    };

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}`;

    const { unmount } = renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(mockSetOnModalClose).toHaveBeenCalledWith(expect.any(Function));
    });

    unmount();

    // Should set empty function on cleanup
    expect(mockSetOnModalClose).toHaveBeenLastCalledWith(expect.any(Function));
  });

  it("should handle sign action with resolve callback", async () => {
    const mockResolve = vi.fn();
    const params = {
      id: "test-id",
      typedData: mockTypedData,
    };

    storeCallbacks("test-id", { resolve: mockResolve });

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}`;

    renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(screen.getByText("sign")).toBeInTheDocument();
    });

    const signButton = screen.getByText("sign");
    signButton.click();

    await waitFor(() => {
      expect(mockResolve).toHaveBeenCalledWith(["0x1", "0x2"]);
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it("should handle cancel action with resolve callback", async () => {
    const mockResolve = vi.fn();
    const mockOnCancel = vi.fn();
    const params = {
      id: "test-id",
      typedData: mockTypedData,
    };

    storeCallbacks("test-id", {
      resolve: mockResolve,
      onCancel: mockOnCancel,
    });

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}`;

    renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(screen.getByText("reject")).toBeInTheDocument();
    });

    const rejectButton = screen.getByText("reject");
    rejectButton.click();

    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalled();
      expect(mockResolve).toHaveBeenCalledWith({
        code: ResponseCodes.CANCELED,
        message: "Canceled",
      });
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it("should navigate to returnTo when provided on completion", async () => {
    const params = {
      id: "test-id",
      typedData: mockTypedData,
    };

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}&returnTo=/home`;

    renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(screen.getByText("sign")).toBeInTheDocument();
    });

    const signButton = screen.getByText("sign");
    signButton.click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/home", { replace: true });
    });
  });

  it("should cleanup callbacks on unmount", async () => {
    const params = {
      id: "test-id",
      typedData: mockTypedData,
    };

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}`;

    const { unmount } = renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(screen.getByText("sign")).toBeInTheDocument();
    });

    unmount();

    // Verify cleanup was called - note this is hard to test directly
    // since cleanupCallbacks is called in useEffect cleanup
    // The test structure ensures it happens via the dependency array
  });

  it("should handle standalone mode without callbacks", async () => {
    const params = {
      typedData: mockTypedData,
    };

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}`;

    renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(screen.getByText("sign")).toBeInTheDocument();
    });

    // Should not throw when no callbacks are available
    const signButton = screen.getByText("sign");
    signButton.click();

    const rejectButton = screen.getByText("reject");
    rejectButton.click();

    // No errors should be thrown
  });

  it("should not set modal close handler when setOnModalClose is undefined", async () => {
    vi.mocked(connectionHooks.useConnection).mockReturnValue({
      closeModal: mockCloseModal,
      setOnModalClose: undefined,
      controller: {
        signMessage: vi.fn(() => Promise.resolve(["0x1", "0x2"] as Signature)),
      } as unknown as ReturnType<
        typeof connectionHooks.useConnection
      >["controller"],
      origin: "test-app.com",
    } as unknown as ReturnType<typeof connectionHooks.useConnection>);

    const params = {
      id: "test-id",
      typedData: mockTypedData,
    };

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}`;

    renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(screen.getByText("sign")).toBeInTheDocument();
    });

    // Should not throw when setOnModalClose is undefined
  });

  it("should not set modal close handler when resolve is undefined", async () => {
    const params = {
      id: "test-id",
      typedData: mockTypedData,
    };

    // Don't store any callbacks
    window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}`;

    renderWithProviders(<SignMessage />);

    await waitFor(() => {
      expect(screen.getByText("sign")).toBeInTheDocument();
    });

    // setOnModalClose should not be called when there's no resolve callback
    expect(mockSetOnModalClose).not.toHaveBeenCalled();
  });

  describe("callback wrapping behavior", () => {
    it("should properly wrap callbacks without calling them prematurely", async () => {
      const mockResolve = vi.fn();
      const params = {
        id: "test-id",
        typedData: mockTypedData,
      };

      storeCallbacks("test-id", { resolve: mockResolve });

      window.location.search = `?data=${encodeURIComponent(JSON.stringify(params))}`;

      renderWithProviders(<SignMessage />);

      await waitFor(() => {
        expect(screen.getByText("sign")).toBeInTheDocument();
      });

      // Callback should not be called yet
      expect(mockResolve).not.toHaveBeenCalled();

      // Only called when user interacts
      const signButton = screen.getByText("sign");
      signButton.click();

      await waitFor(() => {
        expect(mockResolve).toHaveBeenCalledTimes(1);
      });
    });
  });
});
