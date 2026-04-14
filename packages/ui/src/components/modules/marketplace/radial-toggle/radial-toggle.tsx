import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const marketplaceRadialToggleVariants = cva(
  "cursor-pointer data-[active=true]:cursor-default group",
  {
    variants: {
      variant: {
        default: "p-0.5",
      },
      size: {
        md: "h-5 w-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface MarketplaceRadialToggleProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplaceRadialToggleVariants> {
  active?: boolean;
}

export const MarketplaceRadialToggle = React.forwardRef<
  HTMLDivElement,
  MarketplaceRadialToggleProps
>(({ active, className, variant, size }, ref) => {
  return (
    <div
      ref={ref}
      data-active={active}
      className={cn(
        marketplaceRadialToggleVariants({ variant, size }),
        className,
      )}
    >
      <div className="w-full h-full rounded-full flex items-center justify-center p-0.5 border border-background-200 bg-spacer-100">
        <div
          data-active={active}
          className="w-full h-full rounded-full bg-transparent group-hover:bg-background-500 data-[active=true]:bg-primary-100 data-[active=true]:group-hover:bg-primary-100 transition-colors"
        />
      </div>
    </div>
  );
});

export default MarketplaceRadialToggle;
