import { screen, fireEvent, waitFor } from "@testing-library/react";
import { ExecutionContainer } from "./ExecutionContainer";
import { describe, expect, beforeEach, it, vi } from "vitest";
import { renderWithConnection } from "#test/mocks/connection";
import { renderWithProviders } from "#test/mocks/providers";

describe("ExecutionContainer", () => {
  const defaultProps = {
    transactions: [],
    onSubmit: vi.fn(),
    onError: vi.fn(),
    children: <div>Test Content</div>,
    title: "Test Title",
    description: "Test Description",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders basic content correctly", () => {
    renderWithProviders(<ExecutionContainer {...defaultProps} />);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByText("SUBMIT")).toBeInTheDocument();
  });

  it("estimates fees when transactions are provided", async () => {
    const estimateInvokeFee = vi.fn().mockImplementation(async () => ({
      suggestedMaxFee: BigInt(1000),
    }));

    renderWithProviders(
      <ExecutionContainer
        {...defaultProps}
        transactions={[
          {
            contractAddress: "0x123",
            entrypoint: "transfer",
            calldata: ["0x456"],
          },
        ]}
      />,
      {
        connection: {
          controller: {
            estimateInvokeFee,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        },
      },
    );

    await waitFor(() => {
      expect(estimateInvokeFee).toHaveBeenCalled();
    });
  });

  it("handles submit action correctly", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const estimateInvokeFee = vi.fn().mockImplementation(async () => ({
      suggestedMaxFee: BigInt(1000),
    }));

    renderWithProviders(
      <ExecutionContainer
        {...defaultProps}
        transactions={[
          {
            contractAddress: "0x123",
            entrypoint: "transfer",
            calldata: ["0x456"],
          },
        ]}
        onSubmit={onSubmit}
      />,
      {
        connection: {
          controller: {
            estimateInvokeFee,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        },
      },
    );

    // Wait for fee estimation to complete
    await waitFor(() => {
      expect(estimateInvokeFee).toHaveBeenCalled();
    });

    // Wait for the fee to be displayed
    await waitFor(() => {
      expect(screen.getByText("Calculating Fees")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("SUBMIT");
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it("handles submit error correctly", async () => {
    const onError = vi.fn();
    const onSubmit = vi.fn().mockRejectedValue({
      code: 113, // ErrorCode.InsufficientBalance,
      message: "Insufficient balance",
    });
    const estimateInvokeFee = vi.fn().mockImplementation(async () => ({
      suggestedMaxFee: BigInt(1000),
    }));

    renderWithProviders(
      <ExecutionContainer
        {...defaultProps}
        transactions={[
          {
            contractAddress: "0x123",
            entrypoint: "transfer",
            calldata: ["0x456"],
          },
        ]}
        onSubmit={onSubmit}
        onError={onError}
      />,
      {
        connection: {
          controller: {
            estimateInvokeFee,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
        },
      },
    );

    // Wait for fee estimation to complete
    await waitFor(() => {
      expect(estimateInvokeFee).toHaveBeenCalled();
    });

    // Wait for the fee to be displayed
    await waitFor(() => {
      expect(screen.getByText("Calculating Fees")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("SUBMIT");
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("shows deploy view when controller is not deployed", () => {
    renderWithProviders(
      <ExecutionContainer
        {...defaultProps}
        executionError={{
          code: 112, // ErrorCode.CartridgeControllerNotDeployed,
          message: "Controller not deployed",
        }}
      />,
    );

    expect(screen.getByText("DEPLOY ACCOUNT")).toBeInTheDocument();
  });

  it("shows funding view when balance is insufficient", () => {
    renderWithConnection(
      <ExecutionContainer
        {...defaultProps}
        executionError={{
          code: 113, // ErrorCode.InsufficientBalance,
          message: "Insufficient balance",
        }}
      />,
    );

    expect(screen.getByText("ADD FUNDS")).toBeInTheDocument();
  });

  it("shows continue button for already registered session", () => {
    renderWithConnection(
      <ExecutionContainer
        {...defaultProps}
        executionError={{
          code: 132, // ErrorCode.SessionAlreadyRegistered,
          message: "Session already registered",
        }}
      />,
    );

    expect(screen.getByTestId("continue-button")).toBeInTheDocument();
    expect(screen.getByText("Session Already Registered")).toBeInTheDocument();
  });
});
