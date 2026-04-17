import {
  Thumbnail,
  InfoIcon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Spinner,
} from "@cartridge/controller-ui";
import { cn } from "@cartridge/controller-ui/utils";
import { type Token } from "@/hooks/token";
import React from "react";

export type FeesRowProps = {
  label: string;
  amount: number;
  decimals?: number;
  usdValue?: number | string;
  token: Token | undefined;
  isLoading?: boolean;
  tooltipContents?: React.ReactNode;
  className?: string;
};

export function FeesRow(props: FeesRowProps) {
  const { isLoading, tooltipContents } = props;
  if (tooltipContents && !isLoading) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <FeesRowContents {...props} />
          </TooltipTrigger>
          <TooltipContent
            className="px-3 py-2 bg-spacer-100 border border-background-150 rounded select-none"
            style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
            side="top"
            sideOffset={20}
            align="start"
            alignOffset={-11}
          >
            {tooltipContents}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return <FeesRowContents {...props} />;
}

const FeesRowContents = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FeesRowProps
>(
  (
    {
      label,
      amount,
      decimals,
      usdValue,
      token,
      isLoading,
      tooltipContents,
      className,
      ...props
    },
    forwardedRef,
  ) => {
    const amountColor =
      token && token.balance.amount < amount ? "text-destructive" : "";
    return (
      <div
        {...props} // required by TooltipTrigger
        ref={forwardedRef} // required by TooltipTrigger
        className={cn(
          "flex gap-1 w-full items-center justify-between cursor-default",
          className,
        )}
      >
        {isLoading || !token ? (
          <>
            <p className="text-sm text-foreground-300">{label}</p>
            <div className="flex-1" />
            <Spinner />
          </>
        ) : (
          <>
            <p className="text-sm text-foreground-300">{label}</p>
            {tooltipContents && (
              <InfoIcon size="sm" className="text-foreground-300" />
            )}
            <div className="flex-1" />
            {!!usdValue && (
              <p className="text-sm text-foreground-300">
                {typeof usdValue === "string"
                  ? usdValue
                  : `$${usdValue.toFixed(2)}`}
              </p>
            )}
            <Thumbnail
              icon={token.metadata.image || ""}
              size="sm"
              className="ml-1 bg-transparent"
            />
            {!!amount && (
              <p className={cn("text-sm text-foreground-100", amountColor)}>
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
  },
);
