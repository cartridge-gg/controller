import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FeatureProvider } from "@/hooks/features";
import { Fees } from "./Fees";

vi.mock("@/hooks/tokens", () => ({
  useFeeToken: () => ({
    isLoading: false,
    error: null,
    token: {
      address: "0x1",
      balance: 1000n,
      decimals: 18,
      icon: "fee.png",
      name: "Ether",
      price: { value: 2000, currency: "USD" },
      symbol: "ETH",
    },
  }),
  formatBalance: () => "0.01",
  convertTokenAmountToUSD: () => "$0.01",
}));

vi.mock("@/hooks/token", () => ({
  useTokens: () => ({ tokens: [], status: "success" }),
}));

describe("Fees simple view", () => {
  beforeEach(() => localStorage.clear());

  it("keeps the fee amount while hiding network and token detail", async () => {
    render(
      <FeatureProvider>
        <Fees isLoading={false} maxFee={{ overall_fee: "0x1" } as never} />
      </FeatureProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Processing fee")).toBeInTheDocument(),
    );
    expect(screen.getByText("$0.01")).toBeInTheDocument();
    expect(screen.queryByText("Network Fee")).not.toBeInTheDocument();
    expect(screen.queryByText("ETH")).not.toBeInTheDocument();
  });
});
