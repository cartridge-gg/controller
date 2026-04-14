import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const marketplaceSearchResultsVariants = cva(
  "flex flex-col gap-px rounded overflow-hidden shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
  {
    variants: {
      variant: {
        darkest: "bg-background-100",
        darker: "bg-background-200",
        dark: "bg-transparent",
        default: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface MarketplaceSearchResultsProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplaceSearchResultsVariants> {}

export const MarketplaceSearchResults = React.forwardRef<
  HTMLDivElement,
  MarketplaceSearchResultsProps
>(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(marketplaceSearchResultsVariants({ variant }), className)}
      {...props}
    />
  );
});

export default MarketplaceSearchResults;
