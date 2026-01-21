import {
  Thumbnail,
  InfoIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Spinner,
} from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { ERC20 } from "./provider/tokens";

export function Total({
  label,
  token,
  totalValue,
  decimals,
  usdValue,
  tooltipContents,
  isLoading,
  className,
}: {
  label: string;
  token: ERC20 | undefined;
  totalValue: number;
  decimals?: number;
  usdValue?: number | string;
  tooltipContents?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3 w-full", className)}>
      {isLoading || !token ? (
        <div className="flex flex-1 gap-1 p-3 h-10 items-center justify-between bg-background-125 border border-background-200 rounded">
          <p className="text-sm font-medium text-foreground-400">{label}</p>
          <div className="flex-1" />
          <Spinner />
        </div>
      ) : (
        <>
          <div className="flex flex-1 gap-1 p-3 h-10 items-center justify-between bg-background-125 border border-background-200 rounded">
            <p className="text-sm font-medium text-foreground-400">{label}</p>
            {tooltipContents && <TotalTooltip contents={tooltipContents} />}
            <div className="flex-1" />
            {!!usdValue && (
              <p className="text-sm font-medium text-foreground-300 mr-1">
                {typeof usdValue === "string"
                  ? usdValue
                  : `$${usdValue.toFixed(2)}`}
              </p>
            )}
            {!!totalValue && (
              <p className="text-sm font-medium text-foreground-100">
                {`${totalValue.toLocaleString(undefined, {
                  maximumFractionDigits: decimals ?? 2,
                })}`}
              </p>
            )}
          </div>
          <div className="flex gap-1 p-2.5 h-10 items-center justify-between bg-background-125 border border-background-200 rounded">
            <Thumbnail icon={token.icon || ""} size="sm" />
            <p className="text-sm font-medium text-foreground-100">
              {token.symbol}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

const TotalTooltip = ({ contents }: { contents: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <InfoIcon size="xs" className="text-foreground-400" />
        </TooltipTrigger>
        <TooltipContent
          className="px-3 py-2 bg-spacer-100 border border-background-150 rounded select-none"
          side="top"
        >
          {contents}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
