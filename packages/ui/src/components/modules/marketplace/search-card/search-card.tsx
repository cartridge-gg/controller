import { TimesIcon } from "@/components/icons";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const marketplaceSearchCardVariants = cva(
  "group p-1 pl-1.5 rounded-sm flex items-center gap-1 text-primary-100 select-none cursor-pointer transition-colors",
  {
    variants: {
      variant: {
        default: "bg-background-200 hover:bg-background-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface MarketplaceSearchCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplaceSearchCardVariants> {
  image: React.ReactNode;
  label: string;
}

export const MarketplaceSearchCard = React.forwardRef<
  HTMLDivElement,
  MarketplaceSearchCardProps
>(({ image, label, className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(marketplaceSearchCardVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-center gap-1 grow overflow-hidden">
        <div className="w-5 h-5 min-w-5 min-h-5 flex items-center justify-center">
          {image}
        </div>
        <p className="truncate text-sm">{label}</p>
      </div>
      <div className="p-0.5">
        <TimesIcon
          size="xs"
          className="text-foreground-400 group-hover:text-foreground-300 transition-colors"
        />
      </div>
    </div>
  );
});

export default MarketplaceSearchCard;
