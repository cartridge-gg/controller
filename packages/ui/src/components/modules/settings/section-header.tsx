import React from "react";
import { cn } from "@cartridge/controller-ui/utils";
import { Status } from "./status";
import { Spinner } from "@/index";

export interface SectionHeaderProps {
  title: string;
  description: string;
  showStatus?: boolean;
  isActive?: boolean;
  extraContent?: React.ReactNode;
  isLoading?: boolean;
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
      isLoading = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="flex flex-row items-center justify-between">
          <h1 className="flex gap-2 text-foreground-200 text-sm font-medium">
            {title}
            {isLoading && <Spinner />}
          </h1>
          {showStatus && <Status isActive={isActive} />}
          {extraContent}
        </div>
        <p className="text-foreground-300 text-xs font-normal">{description}</p>
      </div>
    );
  },
);

SectionHeader.displayName = "SectionHeader";
