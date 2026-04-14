import { MarketplaceHeaderLabel } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const marketplaceHeaderVariants = cva(
  "h-10 flex justify-between items-center",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface MarketplaceHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplaceHeaderVariants> {
  label: string;
}

export const MarketplaceHeader = React.forwardRef<
  HTMLDivElement,
  MarketplaceHeaderProps
>(({ label, className, variant, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(marketplaceHeaderVariants({ variant }), className)}
      {...props}
    >
      <MarketplaceHeaderLabel label={label} />
      {children}
    </div>
  );
});

export default MarketplaceHeader;
