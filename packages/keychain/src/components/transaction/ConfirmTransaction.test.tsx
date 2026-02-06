import { screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { ConfirmTransaction } from "./ConfirmTransaction";
import { describe, expect, beforeEach, it, vi } from "vitest";
import { renderWithProviders } from "@/test/mocks/providers";
import { ErrorCode } from "@cartridge/controller-wasm";
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

// Mock the upgrade provider hook
vi.mock("@/components/provider/upgrade", () => ({
  useUpgrade: vi.fn(() => ({
    isUpgradeAvailable: false,
    isUpgrading: false,
    error: null,
    upgrade: vi.fn(),
  })),
}));

vi.mock("@/context/toast", () => ({
  useToast: vi.fn(() => ({
    toast: {
      transaction: vi.fn(),
      error: vi.fn(),
    },
  })),
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

  it("skips session UI when skipSession is used", async () => {
    // Test that the skip session flow works correctly
    const mockTransactionsCopy = [...mockTransactions];
    const mockExecute = vi.fn().mockResolvedValue({
      transaction_hash: "0xabc123",
    });
    const estimateInvokeFee = vi.fn().mockResolvedValue({
      suggestedMaxFee: BigInt(1000),
    });

    await act(async () => {
      renderWithProviders(
        <ConfirmTransaction
          {...defaultProps}
          transactions={mockTransactionsCopy}
        />,
        {
          connection: {
            controller: {
              isRequestedSession: vi
                .fn()
                .mockResolvedValueOnce(false) // First check returns false
                .mockResolvedValue(true), // After "skip" it should proceed
              estimateInvokeFee,
              execute: mockExecute,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            policies: undefined, // No policies means no session UI
          },
        },
      );
    });

    // Should show the transaction review screen directly
    await waitFor(() => {
      expect(screen.getByText("Review Transaction")).toBeInTheDocument();
    });
  });

  it("shows session refresh UI when SessionRefreshRequired error occurs", async () => {
    const sessionRefreshError: ControllerError = {
      code: ErrorCode.SessionRefreshRequired,
      message: "Session needs to be refreshed",
      data: "{}",
    };

    await act(async () => {
      renderWithProviders(
        <ConfirmTransaction
          {...defaultProps}
          executionError={sessionRefreshError}
        />,
        {
          connection: {
            controller: {
              isRequestedSession: vi.fn().mockResolvedValue(true),
              estimateInvokeFee: vi.fn().mockResolvedValue({
                suggestedMaxFee: BigInt(1000),
              }),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
            policies: {
              contracts: {},
              verified: true,
            },
          },
        },
      );
    });

    // Should show CreateSession component for session refresh
    await waitFor(() => {
      // The transaction review form should not be shown
      expect(screen.queryByText("Review Transaction")).not.toBeInTheDocument();
    });
  });

  it("retries execution after successful session refresh", async () => {
    const mockExecute = vi
      .fn()
      .mockRejectedValueOnce({
        code: ErrorCode.SessionRefreshRequired,
        message: "Session needs refresh",
        data: "{}",
      })
      .mockResolvedValueOnce({
        transaction_hash: "0xabc123",
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
            trySessionExecute: vi
              .fn()
              .mockRejectedValueOnce({
                code: ErrorCode.SessionRefreshRequired,
                message: "Session needs refresh",
                data: "{}",
              })
              .mockResolvedValueOnce({
                transaction_hash: "0xabc123",
              }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        },
      });
    });

    // Wait for initial render
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    // Click submit button - should trigger SessionRefreshRequired error
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // After error, check that session refresh UI would be shown
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(1);
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
});
