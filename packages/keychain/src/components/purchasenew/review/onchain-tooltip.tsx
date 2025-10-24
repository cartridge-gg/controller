import {
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui";
import { tokenAmountToUsd } from "./token-utils";

/**
 * Onchain quote breakdown for tooltip
 */
interface OnchainQuoteBreakdown {
  basePrice: bigint;
  protocolFee: bigint;
  referralFee: bigint;
  totalCost: bigint;
  paymentToken: string;
}

export const OnchainFeesTooltip = ({
  trigger,
  defaultOpen,
  quote,
}: {
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  quote: OnchainQuoteBreakdown;
}) => {
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
            <span>Base Price:</span>
            <span>{tokenAmountToUsd(quote.basePrice, quote.paymentToken)}</span>
          </div>
          <Separator className="bg-background-125" />
          <div className="flex flex-row justify-between text-foreground-300">
            <span>Protocol Fee:</span>
            <span>
              {tokenAmountToUsd(quote.protocolFee, quote.paymentToken)}
            </span>
          </div>
          {quote.referralFee > 0n && (
            <>
              <div className="flex flex-row justify-between text-foreground-300">
                <span>Referral Fee:</span>
                <span>
                  {tokenAmountToUsd(quote.referralFee, quote.paymentToken)}
                </span>
              </div>
            </>
          )}
          <Separator className="bg-background-125" />
          <div className="flex flex-row justify-between text-foreground-100 font-medium">
            <span>Total:</span>
            <span>{tokenAmountToUsd(quote.totalCost, quote.paymentToken)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
