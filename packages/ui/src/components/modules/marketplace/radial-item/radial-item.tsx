import { MarketplaceRadialToggle } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const marketplaceMarketplaceRadialItemVariants = cva(
  "flex items-center gap-2.5 cursor-pointer data-[active=true]:cursor-default group",
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

export interface MarketplaceRadialItemProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplaceMarketplaceRadialItemVariants> {
  label: string;
  active?: boolean;
}

export const MarketplaceRadialItem = React.forwardRef<
  HTMLDivElement,
  MarketplaceRadialItemProps
>(({ label, active, className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-active={active}
      className={cn(
        marketplaceMarketplaceRadialItemVariants({ variant }),
        className,
      )}
      {...props}
    >
      <MarketplaceRadialToggle active={active} />
      <p className="text-sm text-foreground-100">{label}</p>
    </div>
  );
});

export default MarketplaceRadialItem;
