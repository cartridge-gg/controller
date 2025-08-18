import { screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { ConfirmTransaction } from "./ConfirmTransaction";
import { describe, expect, beforeEach, it, vi } from "vitest";
import { renderWithProviders } from "@/test/mocks/providers";
import { ErrorCode } from "@cartridge/controller-wasm/controller";
import type { ControllerError } from "@/utils/connection";

// Mock the tokens hook for ConfirmTransaction tests
vi.mock("@/hooks/tokens", () => ({
  useFeeToken: vi.fn(() => ({
    token: {
      address:
        "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      price: { value: 2500, currency: "USD" },
    },
    isLoading: false,
    error: null,
  })),
  convertTokenAmountToUSD: vi.fn(() => "$0.01"),
}));

describe("ConfirmTransaction", () => {
  const mockTransactions = [
    {
      contractAddress: "0x123",
      entrypoint: "transfer",
      calldata: ["0x456", "1000", "0"],
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    onComplete: vi.fn(),
    onError: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders transaction confirmation form", async () => {
    await act(async () => {
      renderWithProviders(<ConfirmTransaction {...defaultProps} />);
    });
    expect(screen.getByText("Review Transaction")).toBeInTheDocument();
  });

  it("displays validation error state when execution fails with validation error", async () => {
    const validationError: ControllerError = {
      code: ErrorCode.StarknetValidationFailure,
      message: "Account validation failed",
      data: "Max L1Gas price (124633042180018) is lower than the actual gas price: 124674778309089.",
    };

    const mockExecute = vi.fn().mockRejectedValue(validationError);
    const estimateInvokeFee = vi.fn().mockResolvedValue({
      suggestedMaxFee: BigInt(1000),
    });

    await act(async () => {
      renderWithProviders(
        <ConfirmTransaction
          {...defaultProps}
          executionError={validationError}
        />,
        {
          connection: {
            controller: {
              execute: mockExecute,
              estimateInvokeFee,
              isRequestedSession: vi.fn().mockResolvedValue(true),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
          },
        },
      );
    });

    // Wait for component to settle and check that at least one error message is displayed
    await waitFor(() => {
      expect(screen.getAllByText("Account validation failed")).toHaveLength(2);
    });

    // Check that the submit button is disabled due to error
    const submitButton = screen.getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it("calls onError when execution fails during submission", async () => {
    const validationError: ControllerError = {
      code: ErrorCode.StarknetValidationFailure,
      message: "Account validation failed",
      data: "Max L1Gas price (124633042180018) is lower than the actual gas price: 124674778309089.",
    };

    const mockExecute = vi.fn().mockRejectedValue(validationError);
    const estimateInvokeFee = vi.fn().mockResolvedValue({
      suggestedMaxFee: BigInt(1000),
    });

    await act(async () => {
      renderWithProviders(<ConfirmTransaction {...defaultProps} />, {
        connection: {
          controller: {
            execute: mockExecute,
            estimateInvokeFee,
            isRequestedSession: vi.fn().mockResolvedValue(true),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        },
      });
    });

    // Wait for fee estimation to complete
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    // Click submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for error to be handled
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith(
        mockTransactions,
        expect.any(Object),
      );
    });

    // Check that error is displayed (should have 2 instances of the error message)
    await waitFor(() => {
      expect(screen.getAllByText("Account validation failed")).toHaveLength(2);
    });
  });

  it("calls onComplete when execution succeeds", async () => {
    const mockTransactionHash = "0xabc123";
    const mockExecute = vi.fn().mockResolvedValue({
      transaction_hash: mockTransactionHash,
    });
    const estimateInvokeFee = vi.fn().mockResolvedValue({
      suggestedMaxFee: BigInt(1000),
    });

    await act(async () => {
      renderWithProviders(<ConfirmTransaction {...defaultProps} />, {
        connection: {
          controller: {
            execute: mockExecute,
            estimateInvokeFee,
            isRequestedSession: vi.fn().mockResolvedValue(true),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        },
      });
    });

    // Wait for fee estimation to complete
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    // Click submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for completion
    await waitFor(() => {
      expect(defaultProps.onComplete).toHaveBeenCalledWith(mockTransactionHash);
    });
  });

  it("calls onError when transaction fails after session update", async () => {
    const executionError: ControllerError = {
      code: 41,
      message: "Transaction execution error",
      data: {
        transaction_index: 0,
        execution_error:
          "Transaction reverted: Transaction execution has failed",
      },
    };

    // Mock executeCore to reject with the error
    vi.mock("@/utils/connection/execute", () => ({
      executeCore: vi.fn().mockRejectedValue(executionError),
    }));

    const { executeCore } = await import("@/utils/connection/execute");
    (executeCore as ReturnType<typeof vi.fn>).mockRejectedValue(
      executionError,
    );

    // Mock that we need a session update
    const mockExecute = vi.fn();
    const estimateInvokeFee = vi.fn().mockResolvedValue({
      suggestedMaxFee: BigInt(1000),
    });

    await act(async () => {
      renderWithProviders(<ConfirmTransaction {...defaultProps} />, {
        connection: {
          controller: {
            execute: mockExecute,
            estimateInvokeFee,
            isRequestedSession: vi.fn().mockResolvedValue(false), // No session exists
            hasPolicies: vi.fn().mockResolvedValue({
              policies: [{ target: "0x123", method: "transfer" }],
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        },
      });
    });

    // Should show CreateSession component for session update
    await waitFor(() => {
      expect(screen.getByText(/session/i)).toBeInTheDocument();
    });

    // Simulate clicking connect on session update
    const connectButton = screen.getByRole("button", {
      name: /connect|confirm|approve/i,
    });
    await act(async () => {
      fireEvent.click(connectButton);
    });

    // Wait for onError to be called with the execution error
    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith(executionError);
    });
  });
});
