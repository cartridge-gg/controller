import { describe, expect, it } from "vitest";
import {
  getStarterpackStripeCostDetails,
  getStripeFeeInCents,
} from "./stripe-pricing";

describe("starterpack stripe pricing", () => {
  it("calculates the Stripe fee from the starterpack total", () => {
    expect(getStripeFeeInCents(10750)).toBe(449);
  });

  it("builds starterpack checkout totals without a Cartridge fee", () => {
    const pricing = getStarterpackStripeCostDetails(
      {
        basePrice: 100000000n,
        protocolFee: 2500000n,
        referralFee: 5000000n,
        totalCost: 107500000n,
        paymentToken: "0x1",
        paymentTokenMetadata: {
          symbol: "USDC",
          decimals: 6,
        },
      },
      1,
    );

    expect(pricing).toEqual({
      baseCostInCents: 10750,
      processingFeeInCents: 449,
      totalInCents: 11199,
    });
  });

  it("multiplies the starterpack total before applying the Stripe fee", () => {
    const pricing = getStarterpackStripeCostDetails(
      {
        basePrice: 25000000n,
        protocolFee: 625000n,
        referralFee: 1250000n,
        totalCost: 26875000n,
        paymentToken: "0x1",
        paymentTokenMetadata: {
          symbol: "USDC",
          decimals: 6,
        },
      },
      2,
    );

    expect(pricing).toEqual({
      baseCostInCents: 5375,
      processingFeeInCents: 240,
      totalInCents: 5615,
    });
  });
});
