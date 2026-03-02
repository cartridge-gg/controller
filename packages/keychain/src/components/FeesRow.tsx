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
import { type Token } from "@/hooks/token";

export type FeesRowProps = {
  label: string;
  amount: number;
  decimals?: number;
  usdValue?: number | string;
  tooltipContents?: React.ReactNode;
  token: Token | undefined;
  isLoading?: boolean;
  className?: string;
};

export function FeesRow({
  label,
  amount,
  decimals,
  usdValue,
  tooltipContents,
  token,
  isLoading,
  className,
}: FeesRowProps) {
  const amountColor =
    token && token.balance.amount < amount ? "text-destructive" : "";
  return (
    <div
      className={cn(
        "flex gap-1 w-full items-center justify-between",
        className,
      )}
    >
      {isLoading || !token ? (
        <>
          <p className="text-sm font-medium text-foreground-400">{label}</p>
          <div className="flex-1" />
          <Spinner />
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground-400">{label}</p>
          {tooltipContents && <FeesTooltip contents={tooltipContents} />}
          <div className="flex-1" />
          {!!usdValue && (
            <p className="text-sm font-medium text-foreground-300">
              {typeof usdValue === "string"
                ? usdValue
                : `$${usdValue.toFixed(2)}`}
            </p>
          )}
          <Thumbnail
            icon={token.metadata.image || ""}
            size="sm"
            className="ml-1"
          />
          {!!amount && (
            <p
              className={cn(
                "text-sm font-medium text-foreground-100",
                amountColor,
              )}
            >
              {`${amount.toLocaleString(undefined, {
                maximumFractionDigits: decimals ?? 2,
              })}`}
            </p>
          )}
          <p
            className={cn(
              "text-sm font-medium text-foreground-100",
              amountColor,
            )}
          >
            {token.metadata.symbol}
          </p>
        </>
      )}
    </div>
  );
}

const FeesTooltip = ({ contents }: { contents: React.ReactNode }) => {
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
