import { Button } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const marketplaceHeaderVariants = cva(
  "h-8 px-3 py-2 normal-case tracking-normal font-medium rounded",
  {
    variants: {
      variant: {
        default:
          "text-primary-100 text-xs bg-background-125 hover:bg-background-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface MarketplaceHeaderResetProps
  extends HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof marketplaceHeaderVariants> {
  label?: string;
}

export const MarketplaceHeaderReset = React.forwardRef<
  HTMLButtonElement,
  MarketplaceHeaderResetProps
>(({ label = "Clear", className, variant, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(marketplaceHeaderVariants({ variant }), className)}
      {...props}
    >
      <p>{label}</p>
      {children}
    </Button>
  );
});

export default MarketplaceHeaderReset;
