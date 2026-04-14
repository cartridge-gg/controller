import { MarketplaceRadialItem } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes, useCallback } from "react";

const marketplaceAssetFilterVariants = cva("flex flex-col gap-2 px-2", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface MarketplaceAssetFilterProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplaceAssetFilterVariants> {
  value?: 0 | 1;
  setValue?: (value: number) => void;
}

export const MarketplaceAssetFilter = React.forwardRef<
  HTMLDivElement,
  MarketplaceAssetFilterProps
>(({ value = 0, setValue, className, variant }, ref) => {
  const [active, setActive] = React.useState<number>(value);

  const handleClick = useCallback(
    (value: number) => {
      setActive(value);
      if (!setValue) return;
      setValue(value);
    },
    [setValue, setActive],
  );

  return (
    <div
      ref={ref}
      className={cn(marketplaceAssetFilterVariants({ variant }), className)}
    >
      <MarketplaceRadialItem
        label="Buy Now"
        active={active === 0}
        onClick={() => handleClick(0)}
      />
      <MarketplaceRadialItem
        label="Show All"
        active={active === 1}
        onClick={() => handleClick(1)}
      />
    </div>
  );
});

export default MarketplaceAssetFilter;
