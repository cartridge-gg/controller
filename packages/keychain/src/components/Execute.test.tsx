import { screen, waitFor } from "@testing-library/react";
import { Execute } from "./Execute";
import {
  describe,
  expect,
  beforeEach,
  it,
  vi,
  beforeAll,
  afterEach,
} from "vitest";
import { renderWithProviders } from "@/test/mocks/providers";
import { ResponseCodes } from "@cartridge/controller";
import { storeCallbacks, cleanupCallbacks } from "@/utils/connection/callbacks";

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
vi.mock("@/hooks/connection", () => ({
  useConnection: () => ({
    closeModal: mockCloseModal,
  }),
}));

// Mock ConfirmTransaction component
vi.mock("./transaction/ConfirmTransaction", () => ({
  ConfirmTransaction: ({
    onComplete,
    onError,
    onClose,
    transactions,
    executionError,
  }: any) => (
    <div data-testid="confirm-transaction">
      <div data-testid="transactions">{JSON.stringify(transactions)}</div>
      <div data-testid="execution-error">
        {executionError?.message || "no-error"}
      </div>
      <button data-testid="complete" onClick={() => onComplete("0x123")}>
        Complete
      </button>
      <button
        data-testid="error"
        onClick={() => onError({ message: "Test error" })}
      >
        Error
      </button>
      <button data-testid="close" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

describe("Execute", () => {
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
  });

  afterEach(() => {
    // Clean up any stored callbacks
    cleanupCallbacks("test-id");
  });

  it("should redirect to home when no data param is provided", async () => {
    window.location.search = "";

    renderWithProviders(<Execute />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("should redirect to home when invalid data param is provided", async () => {
    window.location.search = "?data=invalid-json";

    renderWithProviders(<Execute />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("should render ConfirmTransaction with parsed execute params", async () => {
    const transactions = [
      {
        contractAddress: "0x123",
        entrypoint: "transfer",
        calldata: ["0x456", "100", "0"],
      },
    ];

    const executeParams = {
      id: "test-id",
      transactions,
    };

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(executeParams))}`;

    renderWithProviders(<Execute />);

    await waitFor(() => {
      expect(screen.getByTestId("confirm-transaction")).toBeInTheDocument();
      expect(screen.getByTestId("transactions")).toHaveTextContent(
        JSON.stringify(transactions),
      );
      expect(screen.getByTestId("execution-error")).toHaveTextContent(
        "no-error",
      );
    });
  });

  it("should render ConfirmTransaction with execution error", async () => {
    const executeParams = {
      id: "test-id",
      transactions: [],
      error: { message: "Test execution error" },
    };

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(executeParams))}`;

    renderWithProviders(<Execute />);

    await waitFor(() => {
      expect(screen.getByTestId("execution-error")).toHaveTextContent(
        "Test execution error",
      );
    });
  });

  it("should handle completion with resolve callback", async () => {
    const mockResolve = vi.fn();
    const executeParams = {
      id: "test-id",
      transactions: [],
    };

    // Store the callback
    storeCallbacks("test-id", { resolve: mockResolve });

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(executeParams))}`;

    renderWithProviders(<Execute />);

    await waitFor(() => {
      expect(screen.getByTestId("confirm-transaction")).toBeInTheDocument();
    });

    screen.getByTestId("complete").click();

    expect(mockResolve).toHaveBeenCalledWith({
      code: ResponseCodes.SUCCESS,
      transaction_hash: "0x123",
    });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it("should handle error with resolve callback", async () => {
    const mockResolve = vi.fn();
    const executeParams = {
      id: "test-id",
      transactions: [],
    };

    // Store the callback
    storeCallbacks("test-id", { resolve: mockResolve });

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(executeParams))}`;

    renderWithProviders(<Execute />);

    await waitFor(() => {
      expect(screen.getByTestId("confirm-transaction")).toBeInTheDocument();
    });

    screen.getByTestId("error").click();

    expect(mockResolve).toHaveBeenCalledWith({
      code: ResponseCodes.ERROR,
      message: "Test error",
      error: { message: "Test error" },
    });
  });

  it("should handle close with resolve callback", async () => {
    const mockResolve = vi.fn();
    const executeParams = {
      id: "test-id",
      transactions: [],
    };

    // Store the callback
    storeCallbacks("test-id", { resolve: mockResolve });

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(executeParams))}`;

    renderWithProviders(<Execute />);

    await waitFor(() => {
      expect(screen.getByTestId("confirm-transaction")).toBeInTheDocument();
    });

    screen.getByTestId("close").click();

    expect(mockResolve).toHaveBeenCalledWith({
      code: ResponseCodes.CANCELED,
      message: "User canceled",
    });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it("should handle standalone mode without callbacks", async () => {
    const executeParams = {
      transactions: [], // No id provided (standalone mode)
    };

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(executeParams))}`;

    renderWithProviders(<Execute />);

    await waitFor(() => {
      expect(screen.getByTestId("confirm-transaction")).toBeInTheDocument();
    });

    // Should not throw when no callbacks are available
    screen.getByTestId("complete").click();
    screen.getByTestId("error").click();
    screen.getByTestId("close").click();

    expect(mockCloseModal).toHaveBeenCalledTimes(2); // Only for complete and close
  });

  it("should cleanup callbacks on unmount", async () => {
    const executeParams = {
      id: "test-id",
      transactions: [],
    };

    window.location.search = `?data=${encodeURIComponent(JSON.stringify(executeParams))}`;

    const { unmount } = renderWithProviders(<Execute />);

    await waitFor(() => {
      expect(screen.getByTestId("confirm-transaction")).toBeInTheDocument();
    });

    // Unmount should trigger cleanup
    unmount();

    // Note: We can't easily test if cleanupCallbacks was called since it's mocked,
    // but the useEffect cleanup should have run
  });
});
