import {
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@cartridge/ui";
import type { OnchainQuote } from "@/context";
import { usePurchaseContext } from "@/context";

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
}: {
  trigger: React.ReactNode;
  defaultOpen?: boolean;
  quote: OnchainQuote;
}) => {
  const { decimals, symbol } = quote.paymentTokenMetadata;
  const { purchaseItems } = usePurchaseContext();

  // Calculate individual item prices (distribute base price across items)
  const itemPrices = purchaseItems.map((item) => {
    // For now, distribute evenly. In the future, this could be based on actual item prices
    const itemPrice = quote.basePrice / BigInt(purchaseItems.length);
    return {
      ...item,
      tokenPrice: itemPrice,
    };
  });

  // Calculate fees
  const marketplaceFee = 0n; // Marketplace fee is 0 as mentioned
  const creatorRoyalties = 0n; // Creator royalties is 0 as mentioned
  const clientFee = quote.protocolFee + quote.referralFee; // Merge protocol and referral as client fee

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
              <span>
                {formatTokenAmount(item.tokenPrice, decimals, symbol)}
              </span>
            </div>
          ))}

          <Separator className="bg-background-125" />

          {/* Fees */}
          <div className="flex flex-row justify-between text-foreground-300">
            <span>Marketplace Fee:</span>
            <span>
              {formatTokenAmount(marketplaceFee, decimals, symbol)} (0.00%)
            </span>
          </div>

          <div className="flex flex-row justify-between text-foreground-300">
            <span>Creator Royalties:</span>
            <span>
              {formatTokenAmount(creatorRoyalties, decimals, symbol)} (0.00%)
            </span>
          </div>

          <div className="flex flex-row justify-between text-foreground-300">
            <span>Client Fee:</span>
            <span>
              {formatTokenAmount(clientFee, decimals, symbol)} (2.50%)
            </span>
          </div>

          <Separator className="bg-background-125" />

          <div className="flex flex-row justify-between text-foreground-300">
            <span>Total:</span>
            <span>{formatTokenAmount(quote.totalCost, decimals, symbol)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
