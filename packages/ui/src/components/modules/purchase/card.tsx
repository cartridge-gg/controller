import React from "react";
import { cn } from "@/utils";

export interface PurchaseCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  icon: React.ReactNode;
  network?: string;
  networkIcon?: React.ReactNode;
  onClick: () => void;
}

export const PurchaseCard = ({
  text,
  icon,
  network,
  networkIcon,
  className,
  onClick,
  ...props
}: PurchaseCardProps) => {
  return (
    <div
      className={cn(
        "group flex flex-row p-2.5 gap-2 justify-between",
        "w-full h-[40px]",
        "rounded",
        "bg-background-200 hover:bg-background-300",
        "text-foreground-100 text-normal uppercase tracking-[2.1px]",
        "cursor-pointer transition-colors ease-in-out",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center gap-2">
        {React.cloneElement(icon as React.ReactElement<{ size: string }>, {
          size: "sm",
        })}
        <span className="font-ld text-sm">{text}</span>
      </div>
      {network && (
        <div className="flex items-center gap-1 text-foreground-200 text-sm border border-background-300 group-hover:border-background-400 rounded pl-1 pr-2">
          {React.cloneElement(
            networkIcon as React.ReactElement<{ size: string }>,
            { size: "xs" },
          )}
          <span className="font-ld text-xs">{network}</span>
        </div>
      )}
    </div>
  );
};
