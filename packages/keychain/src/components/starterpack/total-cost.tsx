import React from "react";
import { Card, CardContent, InfoIcon, Separator } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";

export interface TotalCostProps extends React.HTMLAttributes<HTMLDivElement> {
  price: number;
  processingFee?: number;
}

export const TotalCost = React.forwardRef<HTMLDivElement, TotalCostProps>(
  ({ price, processingFee, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "flex items-center justify-between flex-1 min-w-[200px]",
          className,
        )}
        {...props}
      >
        <CardContent className="flex flex-col gap-1 w-full border border-solid border-background-200  bg-[#181C19] rounded py-2">
          {processingFee && (
            <ProcessingFee price={price} processingFee={processingFee} />
          )}
          <div className="flex items-center justify-between w-full">
            <span className="text-foreground-300 text-xs font-medium">
              Total
            </span>
            <div className="text-foreground-100 text-sm font-medium">
              ${(price + (processingFee ?? 0)).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

TotalCost.displayName = "TotalCost";

const ProcessingFee = React.memo(
  ({ price, processingFee }: { price: number; processingFee: number }) => {
    return (
      <>
        <div className="flex items-center justify-between w-full">
          <span className="text-foreground-400 text-xs font-normal">Cost</span>
          <div className="text-foreground-400 text-xs font-normal">
            ${price.toFixed(2)}
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-foreground-400 text-xs font-normal">
              Processing Fee
            </span>
            <InfoIcon size="xs" className="text-foreground-400" />
          </div>
          <div className="text-foreground-400 text-xs font-normal">
            {`$${processingFee.toFixed(2)}`}
          </div>
        </div>
        <div className="w-full">
          <Separator className="bg-background-200" />
        </div>
      </>
    );
  },
);
