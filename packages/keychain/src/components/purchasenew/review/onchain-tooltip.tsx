import {
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui";
import type { Quote } from "@/context";

/**
 * Format bigint token amount with symbol
 */
const formatTokenAmount = (
  amount: bigint,
  decimals: number,
  symbol: string,
): string => {
  const value = Number(amount) / Math.pow(10, decimals);
  return `${value.toFixed(2)} ${symbol}`;
};

export const OnchainFeesTooltip = ({
  trigger,
  defaultOpen,
  quote,
  quantity = 1,
}: {
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  quote: Quote;
  quantity?: number;
}) => {
  const { decimals, symbol } = quote.paymentTokenMetadata;

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
            <span>
              {formatTokenAmount(
                quote.basePrice * BigInt(quantity),
                decimals,
                symbol,
              )}
            </span>
          </div>
          <Separator className="bg-background-125" />
          <div className="flex flex-row justify-between text-foreground-300">
            <span>Protocol Fee:</span>
            <span>
              {formatTokenAmount(
                quote.protocolFee * BigInt(quantity),
                decimals,
                symbol,
              )}
            </span>
          </div>
          {quote.referralFee > 0n && (
            <>
              <div className="flex flex-row justify-between text-foreground-300">
                <span>Referral Fee:</span>
                <span>
                  {formatTokenAmount(
                    quote.referralFee * BigInt(quantity),
                    decimals,
                    symbol,
                  )}
                </span>
              </div>
            </>
          )}
          <Separator className="bg-background-125" />
          <div className="flex flex-row justify-between text-foreground-100 font-medium">
            <span>Total:</span>
            <span>
              {formatTokenAmount(
                quote.totalCost * BigInt(quantity),
                decimals,
                symbol,
              )}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
