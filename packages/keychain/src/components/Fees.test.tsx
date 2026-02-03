import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeeEstimate } from "starknet";
import { Fees } from "./Fees";

vi.mock("@/hooks/tokens", () => ({
  useFeeToken: vi.fn(() => ({
    token: {
      address: "0x01",
      symbol: "STRK",
      decimals: 18,
      price: { value: 1, currency: "USD" },
    },
    isLoading: false,
    error: null,
  })),
  convertTokenAmountToUSD: vi.fn(() => "$0.01"),
  formatBalance: vi.fn(() => "0.01"),
}));

describe("Fees", () => {
  it("shows a partial paymaster label when subsidy is applied", () => {
    const estimate = {
      overall_fee: "0x1",
      l1_gas_consumed: "0x0",
      l1_gas_price: "0x0",
      l2_gas_consumed: "0x0",
      l2_gas_price: "0x0",
      l1_data_gas_consumed: "0x0",
      l1_data_gas_price: "0x0",
    } as FeeEstimate;

    render(<Fees isLoading={false} maxFee={estimate} />);

    expect(
      screen.getByText("Partial paymaster subsidy applied"),
    ).toBeInTheDocument();
  });
});
