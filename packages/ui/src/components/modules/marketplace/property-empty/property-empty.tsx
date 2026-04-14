import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const marketplacePropertyEmptyVariants = cva(
  "w-full h-8 flex justify-center items-center select-none",
  {
    variants: {
      variant: {
        default: "text-foreground-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface MarketplacePropertyEmptyProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplacePropertyEmptyVariants> {}

export const MarketplacePropertyEmpty = React.forwardRef<
  HTMLDivElement,
  MarketplacePropertyEmptyProps
>(({ className, variant }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(marketplacePropertyEmptyVariants({ variant }), className)}
    >
      <p className="text-xs">No results</p>
    </div>
  );
});

export default MarketplacePropertyEmpty;
