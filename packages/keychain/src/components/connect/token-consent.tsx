import { cn } from "@cartridge/ui";
import React, { HTMLAttributes } from "react";

export const TokenConsent = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className }, ref) => {
  return (
    <div
      className={cn(
        "w-full flex px-3 py-2.5 items-start justify-between rounded border border-solid border-background-200 bg-background-125",
        className,
      )}
      ref={ref}
    >
      <p className="text-foreground-300 text-xs font-normal">
        You are granting your controller permission to spend the following
        tokens up to the specified amount. If your controller attempts to spend
        more than this during this session you will be notified.
      </p>
    </div>
  );
});

TokenConsent.displayName = "TokenConsent";
