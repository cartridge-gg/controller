import { cn } from "@cartridge/ui/utils";
import React from "react";

export const Status = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isActive?: boolean }
>(({ className, isActive = true, ...props }, ref) => {
  return (
    <div
      className={cn("flex flex-row items-center gap-1", className)}
      ref={ref}
      {...props}
    >
      <div className="p-1 bg-spacer-100 rounded-full size-3 relative flex items-center justify-center">
        <div
          className={cn(
            "rounded-full size-2 absolute",
            isActive ? "bg-constructive-100" : "bg-destructive-100",
            className,
          )}
        />
      </div>
      <p
        className={cn(
          "font-medium text-sm",
          isActive ? "text-constructive-100" : "text-destructive-100",
        )}
      >
        {isActive ? "Active" : "Inactive"}
      </p>
    </div>
  );
});
