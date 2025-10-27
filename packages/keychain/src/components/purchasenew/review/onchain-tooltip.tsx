import {
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui";

/**
 * Onchain quote breakdown for tooltip
 */
interface OnchainQuoteBreakdown {
  basePrice: bigint;
  protocolFee: bigint;
  referralFee: bigint;
  totalCost: bigint;
  paymentToken: string;
  paymentTokenMetadata: {
    symbol: string;
    decimals: number;
  };
}

/**
 * Format bigint token amount to USD string
 */
const formatTokenAmount = (amount: bigint, decimals: number): string => {
  const value = Number(amount) / Math.pow(10, decimals);
  return `$${value.toFixed(2)}`;
};

export const OnchainFeesTooltip = ({
  trigger,
  defaultOpen,
  quote,
}: {
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  quote: OnchainQuoteBreakdown;
}) => {
  const { decimals } = quote.paymentTokenMetadata;

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
            <span>{formatTokenAmount(quote.basePrice, decimals)}</span>
          </div>
          <Separator className="bg-background-125" />
          <div className="flex flex-row justify-between text-foreground-300">
            <span>Protocol Fee:</span>
            <span>{formatTokenAmount(quote.protocolFee, decimals)}</span>
          </div>
          {quote.referralFee > 0n && (
            <>
              <div className="flex flex-row justify-between text-foreground-300">
                <span>Referral Fee:</span>
                <span>{formatTokenAmount(quote.referralFee, decimals)}</span>
              </div>
            </>
          )}
          <Separator className="bg-background-125" />
          <div className="flex flex-row justify-between text-foreground-100 font-medium">
            <span>Total:</span>
            <span>{formatTokenAmount(quote.totalCost, decimals)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
