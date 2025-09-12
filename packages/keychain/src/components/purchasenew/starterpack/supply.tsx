import { TagIcon } from "@cartridge/ui";
import { cn } from "@cartridge/ui";
import React, { HTMLAttributes } from "react";

export interface SupplyProps {
  amount: number;
}

export const Supply = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & SupplyProps
>(({ amount, className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex gap-1 py-[2px] px-[8px] rounded-full bg-background-200 text-sm font-semibold",
        amount > 0 ? "text-foreground-100" : "text-destructive-100",
        className,
      )}
      ref={ref}
      {...props}
    >
      {amount > 0 ? (
        <>
          <TagIcon size="sm" variant="solid" /> {amount} left
        </>
      ) : (
        <>Out of stock</>
      )}
    </div>
  );
});

Supply.displayName = "Supply";
