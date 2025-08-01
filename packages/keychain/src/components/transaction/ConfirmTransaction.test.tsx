import { screen, fireEvent, waitFor } from "@testing-library/react";
import { ConfirmTransaction } from "./ConfirmTransaction";
import { describe, expect, beforeEach, it, vi } from "vitest";
import { renderWithProviders } from "@/test/mocks/providers";
import { ErrorCode } from "@cartridge/controller-wasm/controller";
import type { ControllerError } from "@/utils/connection";

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

  it("renders transaction confirmation form", () => {
    renderWithProviders(<ConfirmTransaction {...defaultProps} />);
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

    renderWithProviders(
      <ConfirmTransaction {...defaultProps} executionError={validationError} />,
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

    // Wait for component to settle
    await waitFor(() => {
      expect(screen.getByText("Account validation failed")).toBeInTheDocument();
    });

    // Check that the error details are displayed
    expect(
      screen.getByText(/Max L1Gas price.*is lower than the actual gas price/),
    ).toBeInTheDocument();

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

    // Wait for fee estimation to complete
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    // Click submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    // Wait for error to be handled
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith(
        mockTransactions,
        expect.any(Object),
      );
    });

    // Check that error is displayed
    await waitFor(() => {
      expect(screen.getByText("Account validation failed")).toBeInTheDocument();
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

    // Wait for fee estimation to complete
    await waitFor(() => {
      const submitButton = screen.getByRole("button", { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    // Click submit button
    const submitButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    // Wait for completion
    await waitFor(() => {
      expect(defaultProps.onComplete).toHaveBeenCalledWith(mockTransactionHash);
    });
  });
});
