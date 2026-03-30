import type { Quote } from "@/context";
import type { CostDetails } from "../types";

const STRIPE_FIXED_FEE_CENTS = 30;

export const getStripeFeeInCents = (baseCostInCents: number): number => {
  const percentFeeInCents = Math.round(baseCostInCents * 0.039);
  return percentFeeInCents + STRIPE_FIXED_FEE_CENTS;
};

export const getStarterpackStripeCostDetails = (
  quote: Quote,
  quantity: number,
): CostDetails => {
  const totalCost = quote.totalCost * BigInt(quantity);
  const decimalsOffset = quote.paymentTokenMetadata.decimals - 2;

  const baseCostInCents =
    decimalsOffset >= 0
      ? Number(
          (totalCost + 10n ** BigInt(decimalsOffset) / 2n) /
            10n ** BigInt(decimalsOffset),
        )
      : Number(totalCost * 10n ** BigInt(Math.abs(decimalsOffset)));

  const processingFeeInCents = getStripeFeeInCents(baseCostInCents);

  return {
    baseCostInCents,
    processingFeeInCents,
    totalInCents: baseCostInCents + processingFeeInCents,
  };
};
