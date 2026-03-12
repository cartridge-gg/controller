import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StripePurchaseSuccess } from "./success";
import { ItemType } from "@/context";

const mocks = vi.hoisted(() => ({
  handlePlay: vi.fn(),
  useStarterpackContext: vi.fn(),
  useOnchainPurchaseContext: vi.fn(),
  useCreditPurchaseContext: vi.fn(),
  useConnection: vi.fn(),
  useStripePaymentQuery: vi.fn(),
}));

vi.mock("@/context", () => ({
  ItemType: {
    CREDIT: "CREDIT",
    ERC20: "ERC20",
    NFT: "NFT",
  },
  useStarterpackContext: mocks.useStarterpackContext,
  useOnchainPurchaseContext: mocks.useOnchainPurchaseContext,
  useCreditPurchaseContext: mocks.useCreditPurchaseContext,
}));

vi.mock("@/hooks/connection", () => ({
  useConnection: mocks.useConnection,
}));

vi.mock("@/hooks/starterpack", () => ({
  useStarterpackPlayHandler: () => mocks.handlePlay,
}));

vi.mock("@/utils/api", () => ({
  PurchaseFulfillmentStatus: {
    AwaitingPayment: "AWAITING_PAYMENT",
    Confirmed: "CONFIRMED",
    Failed: "FAILED",
    Processing: "PROCESSING",
    Queued: "QUEUED",
    Submitted: "SUBMITTED",
  },
  StripePaymentStatus: {
    Failed: "FAILED",
    Pending: "PENDING",
    Succeeded: "SUCCEEDED",
  },
  useStripePaymentQuery: mocks.useStripePaymentQuery,
}));

describe("StripePurchaseSuccess", () => {
  beforeEach(() => {
    mocks.handlePlay.mockReset();
    mocks.useStarterpackContext.mockReset();
    mocks.useCreditPurchaseContext.mockReset();
    mocks.useConnection.mockReset();
    mocks.useStripePaymentQuery.mockReset();
    mocks.useOnchainPurchaseContext.mockReturnValue({ quantity: 2 });
    mocks.useConnection.mockReturnValue({ isMainnet: true });
  });

  it("shows Stripe and Starknet stages while fulfillment is still in progress", () => {
    mocks.useStripePaymentQuery.mockReturnValue({
      data: {
        stripePayment: {
          paymentStatus: "SUCCEEDED",
          purchaseFulfillment: {
            id: "fulfillment-1",
            status: "QUEUED",
            transactionHash: null,
            lastError: null,
          },
        },
      },
      error: null,
      isLoading: false,
      isFetching: true,
      refetch: vi.fn(),
    });

    render(
      <StripePurchaseSuccess
        items={[
          {
            title: "Village Pass",
            subtitle: "NFT",
            icon: "https://example.com/pass.png",
            type: ItemType.NFT,
          },
        ]}
        name="Starterpack"
        stripePaymentId="stripe_123"
      />,
    );

    expect(screen.getByText("Purchasing Starterpack")).toBeInTheDocument();
    expect(screen.getByText("Receiving (2)")).toBeInTheDocument();
    expect(screen.getByText("Confirmed on Stripe")).toBeInTheDocument();
    expect(screen.getByText("Purchasing on Starknet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
  });

  it("enables play after Starknet fulfillment is confirmed", () => {
    mocks.useStripePaymentQuery.mockReturnValue({
      data: {
        stripePayment: {
          paymentStatus: "SUCCEEDED",
          purchaseFulfillment: {
            id: "fulfillment-1",
            status: "CONFIRMED",
            transactionHash: "0xabc123",
            lastError: null,
          },
        },
      },
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(
      <StripePurchaseSuccess
        items={[
          {
            title: "Village Pass",
            subtitle: "NFT",
            icon: "https://example.com/pass.png",
            type: ItemType.NFT,
          },
        ]}
        name="Starterpack"
        stripePaymentId="stripe_123"
      />,
    );

    const playButton = screen.getByRole("button", { name: "Play" });

    expect(screen.getByText("Purchase Complete")).toBeInTheDocument();
    expect(screen.getByText("You Received (2)")).toBeInTheDocument();
    expect(screen.getByText("Confirmed on Starknet")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      expect.stringContaining("0xabc123"),
    );
    expect(playButton).toBeEnabled();

    fireEvent.click(playButton);

    expect(mocks.handlePlay).toHaveBeenCalledTimes(1);
  });
});
