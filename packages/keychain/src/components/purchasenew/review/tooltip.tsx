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
  const { layerswapFees } = useOnchainPurchaseContext();

  const cartridgeFeeInCents = useMemo(() => {
    const percent = isStripe ? 0.05 : 0.025;
    // round to nearest cent
    return Math.round(costDetails.baseCostInCents * percent);
  }, [costDetails.baseCostInCents, isStripe]);

  const stripeFeeInCents = useMemo(() => {
    if (!isStripe) return 0;
    const percentFee = Math.round(costDetails.baseCostInCents * 0.039); // 3.9% percent part
    return percentFee + STRIPE_FIXED_FEE_CENTS; // include fixed fee
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
