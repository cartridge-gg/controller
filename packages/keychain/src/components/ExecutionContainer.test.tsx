import { screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { ExecutionContainer } from "./ExecutionContainer";
import { describe, expect, beforeEach, it, vi } from "vitest";
import { renderWithConnection } from "@/test/mocks/connection";
import { renderWithProviders } from "@/test/mocks/providers";

// Mock the tokens hook for ExecutionContainer tests
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

  it("renders basic content correctly", async () => {
    await act(async () => {
      renderWithProviders(<ExecutionContainer {...defaultProps} />);
    });
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByText("SUBMIT")).toBeInTheDocument();
  });

  it("estimates fees when transactions are provided", async () => {
    const estimateInvokeFee = vi.fn().mockImplementation(async () => ({
      suggestedMaxFee: BigInt(1000),
    }));

    await act(async () => {
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
    });

    await waitFor(() => {
      expect(estimateInvokeFee).toHaveBeenCalled();
    });
  });

  it("handles submit action correctly", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const estimateInvokeFee = vi.fn().mockImplementation(async () => ({
      suggestedMaxFee: BigInt(1000),
    }));

    await act(async () => {
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
    });

    // Wait for fee estimation to be called
    await waitFor(() => {
      expect(estimateInvokeFee).toHaveBeenCalled();
    });

    // Give the component time to process the result
    await waitFor(
      () => {
        const submitButton = screen.getByText("SUBMIT");
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 3000 },
    );

    const submitButton = screen.getByText("SUBMIT");
    await act(async () => {
      fireEvent.click(submitButton);
    });

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
    const estimateInvokeFee = vi.fn().mockResolvedValue({
      suggestedMaxFee: BigInt(1000),
    });

    await act(async () => {
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
    });

    // Wait for fee estimation to be called and complete
    await waitFor(() => {
      expect(estimateInvokeFee).toHaveBeenCalled();
    });

    // Give time for state updates to propagate
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Now check if the button is available and not disabled
    await waitFor(() => {
      const submitButton = screen.getByText("SUBMIT");
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByText("SUBMIT");

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("shows deploy view when controller is not deployed", async () => {
    await act(async () => {
      renderWithProviders(
        <ExecutionContainer
          {...defaultProps}
          executionError={{
            code: 112, // ErrorCode.CartridgeControllerNotDeployed,
            message: "Controller not deployed",
          }}
        />,
      );
    });

    expect(screen.getByText("DEPLOY ACCOUNT")).toBeInTheDocument();
  });

  it("shows funding view when balance is insufficient", async () => {
    await act(async () => {
      renderWithConnection(
        <ExecutionContainer
          {...defaultProps}
          executionError={{
            code: 113, // ErrorCode.InsufficientBalance,
            message: "Insufficient balance",
          }}
        />,
      );
    });

    expect(screen.getByText("ADD FUNDS")).toBeInTheDocument();
  });

  it("shows continue button for already registered session", async () => {
    await act(async () => {
      renderWithConnection(
        <ExecutionContainer
          {...defaultProps}
          executionError={{
            code: 132, // ErrorCode.SessionAlreadyRegistered,
            message: "Session already registered",
          }}
        />,
      );
    });

    expect(screen.getByTestId("continue-button")).toBeInTheDocument();
    expect(screen.getByText("Session Already Registered")).toBeInTheDocument();
  });
});
