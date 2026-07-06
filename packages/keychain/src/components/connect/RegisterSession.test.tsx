import { vi, describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { RegisterSession } from "./RegisterSession";
import { renderWithProviders } from "@/test/mocks/providers";
import type { ParsedSessionPolicies } from "@/hooks/session";

// Mock the tokens hook for the Fees component rendered by ExecutionContainer
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
  useTokens: vi.fn(() => ({
    tokens: [],
    registerPair: vi.fn(),
    isLoading: false,
  })),
}));

// Mock useConnection hook
const mockUseConnection = vi.fn();
vi.mock("@/hooks/connection", () => ({
  useConnection: () => mockUseConnection(),
}));

const policies: ParsedSessionPolicies = {
  verified: false,
};

describe("RegisterSession", () => {
  const publicKey = "0x456";

  const makeController = () => ({
    address: vi.fn(() => "0x123456789abcdef"),
    username: vi.fn(() => "testuser"),
    registerSessionCalldata: vi.fn().mockResolvedValue(["0x1"]),
    // Fee estimation fails on funds: no maxFee is available up front.
    estimateInvokeFee: vi.fn().mockRejectedValue({
      code: 113, // ErrorCode.InsufficientBalance
      message: "Insufficient balance",
    }),
    registerSession: vi.fn().mockResolvedValue({ transaction_hash: "0xabc" }),
    provider: {
      // Account is deployed, so the estimate error stays InsufficientBalance.
      getClassHashAt: vi.fn().mockResolvedValue("0x0"),
      waitForTransaction: vi.fn().mockResolvedValue({}),
    },
  });

  const makeConnection = (
    controller: ReturnType<typeof makeController>,
    isAppchain: boolean,
  ) => ({
    controller,
    origin: "https://test.app",
    isAppchain,
    policies: undefined,
    theme: {
      name: "TestApp",
      verified: true,
      icon: "icon-url",
      cover: "cover-url",
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers the session on an appchain even when no fee estimate is available", async () => {
    const onConnect = vi.fn();
    const controller = makeController();
    mockUseConnection.mockReturnValue(makeConnection(controller, true));

    await act(async () => {
      renderWithProviders(
        <RegisterSession
          policies={policies}
          onConnect={onConnect}
          publicKey={publicKey}
        />,
      );
    });

    await waitFor(() => {
      expect(controller.estimateInvokeFee).toHaveBeenCalled();
    });

    // The appchain bypass offers the action instead of gating on funds
    const submitButton = await screen.findByRole("button", {
      name: /register session/i,
    });
    expect(screen.queryByText("ADD FUNDS")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(submitButton);
    });

    // The submission proceeds without an upfront maxFee (wasm estimates internally)
    await waitFor(() => {
      expect(controller.registerSession).toHaveBeenCalled();
    });
    expect(controller.registerSession.mock.calls[0][4]).toBeUndefined();

    await waitFor(() => {
      expect(onConnect).toHaveBeenCalledWith("0xabc", expect.any(BigInt));
    });
  });

  it("keeps the Add Funds flow on public chains when balance is insufficient", async () => {
    const onConnect = vi.fn();
    const controller = makeController();
    mockUseConnection.mockReturnValue(makeConnection(controller, false));

    await act(async () => {
      renderWithProviders(
        <RegisterSession
          policies={policies}
          onConnect={onConnect}
          publicKey={publicKey}
        />,
      );
    });

    await waitFor(() => {
      expect(controller.estimateInvokeFee).toHaveBeenCalled();
    });

    expect(await screen.findByText("ADD FUNDS")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /register session/i }),
    ).not.toBeInTheDocument();
    expect(controller.registerSession).not.toHaveBeenCalled();
  });
});
