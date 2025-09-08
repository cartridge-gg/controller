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
  const { layerswapFees } = usePurchaseContext();

  const cartridgeFee = useMemo(() => {
    if (isStripe) {
      return convertCentsToDollars(costDetails.baseCostInCents * 0.05); // 5% fee for Stripe payments
    } else {
      return convertCentsToDollars(costDetails.baseCostInCents * 0.025); // 2.5% fee for crypto payments
    }
  }, [costDetails, isStripe]);

  const stripeFee = useMemo(() => {
    if (isStripe) {
      return convertCentsToDollars(costDetails.baseCostInCents * 0.039); // 3.9% fee for Stripe payments
    } else {
      return convertCentsToDollars(0);
    }
  }, [costDetails, isStripe]);

  return (
    <TooltipProvider>
      <Tooltip defaultOpen={defaultOpen}>
        <TooltipTrigger>{trigger}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="flex flex-col gap-2 bg-spacer-100 border border-background-150 text-foreground-400 min-w-[240px]"
        >
          <div className="flex flex-row justify-between text-foreground-300">
            <span>Credits:</span>
            <span>{convertCentsToDollars(costDetails.baseCostInCents)}</span>
          </div>
          <Separator className="bg-background-125" />
          {isStripe && (
            <div className="flex flex-row justify-between text-foreground-300">
              <span>Stripe Fee:</span>
              <span>{stripeFee}</span>
            </div>
          )}
          <div className="flex flex-row justify-between text-foreground-300">
            <span>Cartridge Fee:</span>
            <span>{cartridgeFee}</span>
          </div>
          {layerswapFees && (
            <div className="flex flex-row justify-between text-foreground-300">
              Layerswap Bridging Fee:{" "}
              <div>${(Number(layerswapFees) / 1e6).toFixed(2)}</div>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
