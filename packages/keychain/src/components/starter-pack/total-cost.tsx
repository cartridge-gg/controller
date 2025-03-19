import React from "react";
import { Card, CardContent, cn, InfoIcon } from "@cartridge/ui-next";

export interface TotalCostProps extends React.HTMLAttributes<HTMLDivElement> {
  price: number;
}

export const TotalCost = React.forwardRef<HTMLDivElement, TotalCostProps>(
  ({ price, className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "flex items-center justify-between bg-background-200 flex-1 min-w-[200px]",
          className,
        )}
        {...props}
      >
        <CardContent className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-foreground-300 text-xs font-medium">
              Total
            </span>
            <InfoIcon size="xs" className="text-foreground-300" />
          </div>
          <div className="text-foreground-100 text-sm font-medium">
            ${price.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    );
  },
);
