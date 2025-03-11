import React from "react";
import { Status } from "./status";
import { cn } from "@cartridge/ui-next";

export interface SectionHeaderProps {
  title: string;
  description: string;
  showStatus?: boolean;
}

export const SectionHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SectionHeaderProps
>(({ className, title, description, showStatus = false, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-foreground-200 text-sm font-medium">{title}</h1>
        {showStatus && <Status isActive={false} />}
      </div>
      <p className="text-foreground-300 text-xs font-normal">{description}</p>
    </div>
  );
});

SectionHeader.displayName = "SectionHeader";
