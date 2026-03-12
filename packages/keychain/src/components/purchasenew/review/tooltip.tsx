import { CostDetails, useOnchainPurchaseContext } from "@/context";
import {
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui";
import { convertCentsToDollars } from "./cost";
import { useMemo } from "react";
import { getStripeFeeInCents } from "./stripe-pricing";

export const FeesTooltip = ({
  trigger,
  defaultOpen,
  isStripe,
  costDetails,
  lineItemLabel = "Credits",
  hideCartridgeFee = false,
}: {
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  isStripe: boolean;
  costDetails: CostDetails;
  lineItemLabel?: string;
  hideCartridgeFee?: boolean;
}) => {
  const { layerswapFees } = useOnchainPurchaseContext();

  const cartridgeFeeInCents = useMemo(() => {
    if (hideCartridgeFee) return 0;
    const percent = isStripe ? 0.05 : 0.025;
    // round to nearest cent
    return Math.round(costDetails.baseCostInCents * percent);
  }, [costDetails.baseCostInCents, hideCartridgeFee, isStripe]);

  const stripeFeeInCents = useMemo(() => {
    if (!isStripe) return 0;
    return getStripeFeeInCents(costDetails.baseCostInCents);
  }, [costDetails.baseCostInCents, isStripe]);

  const cartridgeFee = convertCentsToDollars(cartridgeFeeInCents);
  const stripeFee = convertCentsToDollars(stripeFeeInCents);

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
            <span>{lineItemLabel}:</span>
            <span>{convertCentsToDollars(costDetails.baseCostInCents)}</span>
          </div>
          <Separator className="bg-background-125" />
          {isStripe && (
            <div className="flex flex-row justify-between text-foreground-300">
              <span>Stripe Fee:</span>
              <span>{stripeFee}</span>
            </div>
          )}
          {!hideCartridgeFee && (
            <div className="flex flex-row justify-between text-foreground-300">
              <span>Cartridge Fee:</span>
              <span>{cartridgeFee}</span>
            </div>
          )}
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
