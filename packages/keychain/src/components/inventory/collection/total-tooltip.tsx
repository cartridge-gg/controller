import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Separator,
} from "@cartridge/ui";

export const TotalTooltip = ({
  trigger,
  tokens,
  fees,
  fixedFeeValue,
  symbol,
}: {
  trigger: React.ReactNode;
  tokens: { name: string; amount: string }[];
  fees: { label: string; amount: number; percentage: number }[];
  fixedFeeValue: number;
  symbol: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="ml-2 px-3 py-2 bg-spacer-100 border border-background-150 rounded flex flex-col gap-2 select-none"
        >
          <div className="flex flex-col gap-1 text-foreground-300">
            {tokens.map((token, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <span>{token.name}</span>
                <span>
                  {token.amount} {symbol}
                </span>
              </div>
            ))}
          </div>
          <Separator className="bg-background-100" />
          <div className="flex flex-col gap-1 text-foreground-300">
            {fees.map((fee) => (
              <div
                key={fee.label}
                className="flex items-center justify-between gap-4 text-xs"
              >
                {fee.label}
                <div className="flex items-center gap-1">
                  <span>
                    {fee.amount.toLocaleString(undefined, {
                      maximumFractionDigits: fixedFeeValue,
                    })}
                  </span>
                  <span>{symbol}</span>
                  <span>({fee.percentage.toFixed(2)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
