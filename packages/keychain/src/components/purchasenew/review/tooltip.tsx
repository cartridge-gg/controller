import { CostDetails, usePurchaseContext } from "@/context";
import {
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui";
import { convertCentsToDollars } from "./cost";
import { useMemo } from "react";

const STRIPE_FIXED_FEE_CENTS = 30; // $0.30

export const FeesTooltip = ({
  trigger,
  defaultOpen,
  isStripe,
  costDetails,
}: {
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  isStripe: boolean;
  costDetails: CostDetails;
}) => {
  const { layerswapFees, purchaseItems } = usePurchaseContext();

  // Calculate individual item prices (distribute base cost across items)
  const itemPrices = useMemo(() => {
    if (purchaseItems.length === 0) return [];

    return purchaseItems.map((item) => {
      // For now, distribute evenly. In the future, this could be based on actual item prices
      const itemPrice = costDetails.baseCostInCents / purchaseItems.length;
      return {
        ...item,
        priceInCents: Math.round(itemPrice),
      };
    });
  }, [purchaseItems, costDetails.baseCostInCents]);

  const clientFeeInCents = useMemo(() => {
    const cartridgePercent = isStripe ? 0.05 : 0.025;
    const cartridgeFee = Math.round(
      costDetails.baseCostInCents * cartridgePercent,
    );

    if (!isStripe) return cartridgeFee;

    // Add Stripe fee to Cartridge fee for total client fee
    const stripePercentFee = Math.round(costDetails.baseCostInCents * 0.039); // 3.9% percent part
    const stripeTotalFee = stripePercentFee + STRIPE_FIXED_FEE_CENTS; // include fixed fee

    return cartridgeFee + stripeTotalFee;
  }, [costDetails.baseCostInCents, isStripe]);

  const clientFeePercentage = isStripe ? "8.9%" : "2.5%"; // Approximate combined percentage for Stripe + Cartridge

  return (
    <TooltipProvider>
      <Tooltip defaultOpen={defaultOpen}>
        <TooltipTrigger>{trigger}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="flex flex-col gap-2 bg-spacer-100 border border-background-150 text-foreground-400 min-w-[280px]"
        >
          {/* Purchase Items */}
          {itemPrices.map((item, index) => (
            <div
              key={index}
              className="flex flex-row justify-between text-foreground-300"
            >
              <span>{item.title}</span>
              <span>{convertCentsToDollars(item.priceInCents)}</span>
            </div>
          ))}

          <Separator className="bg-background-125" />

          {/* Fees */}
          <div className="flex flex-row justify-between text-foreground-300">
            <span>Marketplace Fee:</span>
            <span>$0.00 (0.00%)</span>
          </div>

          <div className="flex flex-row justify-between text-foreground-300">
            <span>Creator Royalties:</span>
            <span>$0.00 (0.00%)</span>
          </div>

          <div className="flex flex-row justify-between text-foreground-300">
            <span>Client Fee:</span>
            <span>
              {convertCentsToDollars(clientFeeInCents)} ({clientFeePercentage})
            </span>
          </div>

          {layerswapFees && (
            <div className="flex flex-row justify-between text-foreground-300">
              <span>Layerswap Bridging Fee:</span>
              <span>${(Number(layerswapFees) / 1e6).toFixed(2)}</span>
            </div>
          )}

          <Separator className="bg-background-125" />

          <div className="flex flex-row justify-between text-foreground-300">
            <span>Total:</span>
            <span>{convertCentsToDollars(costDetails.totalInCents)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
