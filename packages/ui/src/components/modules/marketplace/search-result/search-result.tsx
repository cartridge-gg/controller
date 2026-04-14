import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const marketplaceSearchResultVariants = cva(
  "px-3 py-2.5 flex gap-3 select-none cursor-pointer transition-colors duration-150",
  {
    variants: {
      variant: {
        darkest: "bg-spacer-100 hover:bg-background-100",
        darker: "bg-background-100 hover:bg-background-200",
        dark: "bg-background-125 hover:bg-background-200",
        default: "bg-background-150 hover:bg-background-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface MarketplaceSearchResultProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplaceSearchResultVariants> {
  image: React.ReactNode;
  label: string;
}

export const MarketplaceSearchResult = React.forwardRef<
  HTMLDivElement,
  MarketplaceSearchResultProps
>(({ image, label, className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(marketplaceSearchResultVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-center gap-1 grow overflow-hidden">
        <div className="w-5 h-5 min-w-5 min-h-5 flex items-center justify-center">
          {image}
        </div>
        <p className="truncate text-sm font-medium">{label}</p>
      </div>
    </div>
  );
});

export default MarketplaceSearchResult;
