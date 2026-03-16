import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeesTooltip } from "./tooltip";

vi.mock("@/context", () => ({
  useOnchainPurchaseContext: () => ({
    layerswapFees: undefined,
  }),
}));

describe("FeesTooltip", () => {
  it("shows Starterpack instead of Credits when requested", () => {
    render(
      <FeesTooltip
        trigger={<span>Info</span>}
        defaultOpen
        isStripe
        lineItemLabel="Starterpack"
        costDetails={{
          baseCostInCents: 1_000,
          processingFeeInCents: 59,
          totalInCents: 1_059,
        }}
      />,
    );

    expect(screen.getAllByText("Starterpack:").length).toBeGreaterThan(0);
    expect(screen.queryByText("Credits:")).not.toBeInTheDocument();
  });
});
