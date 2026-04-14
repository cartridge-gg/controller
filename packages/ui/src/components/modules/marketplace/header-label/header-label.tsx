import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const marketplaceHeaderLabelVariants = cva("flex px-2 py-3 select-none", {
  variants: {
    variant: {
      default: "text-xs font-semibold tracking-wider text-foreground-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface MarketplaceHeaderLabelProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplaceHeaderLabelVariants> {
  label: string;
}

export const MarketplaceHeaderLabel = React.forwardRef<
  HTMLDivElement,
  MarketplaceHeaderLabelProps
>(({ label, className, variant, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(marketplaceHeaderLabelVariants({ variant }), className)}
      {...props}
    >
      <p>{label}</p>
      {children}
    </div>
  );
});

export default MarketplaceHeaderLabel;
