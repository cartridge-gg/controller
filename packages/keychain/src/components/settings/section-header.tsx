import { cn } from "@cartridge/ui/utils";
import React from "react";
import { Status } from "./status";

export interface SectionHeaderProps {
  title: string;
  description: string;
  showStatus?: boolean;
  isActive?: boolean;
  extraContent?: React.ReactNode;
}

export const SectionHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SectionHeaderProps
>(
  (
    {
      className,
      title,
      description,
      showStatus = false,
      isActive = false,
      extraContent,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-foreground-200 text-sm font-medium">{title}</h1>
          {showStatus && <Status isActive={isActive} />}
          {extraContent}
        </div>
        <p className="text-foreground-300 text-xs font-normal">{description}</p>
      </div>
    );
  },
);

SectionHeader.displayName = "SectionHeader";
