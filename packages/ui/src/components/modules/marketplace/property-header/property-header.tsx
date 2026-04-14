import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const marketplacePropertyHeaderVariants = cva("h-9 cursor-pointer", {
  variants: {
    variant: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface MarketplacePropertyHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof marketplacePropertyHeaderVariants> {
  label: string;
  count: number;
}

export const MarketplacePropertyHeader = React.forwardRef<
  HTMLDivElement,
  MarketplacePropertyHeaderProps
>(({ label, count, className, variant, children }, ref) => {
  return (
    <Accordion ref={ref} type="single" collapsible>
      <AccordionItem value="item-1">
        <div
          className={cn(
            marketplacePropertyHeaderVariants({ variant }),
            className,
          )}
        >
          <AccordionTrigger
            className="grow pr-2 flex justify-between items-center"
            parentClassName="group px-3 py-2 bg-background-200 hover:bg-background-300 [&[data-state=open]]:bg-background-300 text-foreground-300 hover:text-foreground-200 rounded"
            wedgeIconSize="sm"
          >
            <p className="text-xs text-foreground-100">{label}</p>
            <span className="text-xs text-foreground-300 group-hover:text-foreground-200 transition-colors">
              {count}
            </span>
          </AccordionTrigger>
        </div>
        <AccordionContent className="pt-2 gap-2">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
});

export default MarketplacePropertyHeader;
