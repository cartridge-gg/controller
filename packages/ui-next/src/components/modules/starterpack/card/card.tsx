import React from "react";
import { GiftIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/utils";
import { CardListItem } from "@/components/primitives";

export interface StarterpackCardProps {
  item: string;
  isClaimed?: boolean;
}

export const StarterpackCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StarterpackCardProps
>(({ item, isClaimed = false, className, ...props }, ref) => {
  return (
    <CardListItem
      ref={ref}
      {...props}
      className="flex flex-row items-center py-2 px-3 bg-background-200"
    >
      <div
        className={cn(
          "flex flex-row items-center gap-3 text-foreground-100",
          isClaimed ? "text-foreground-400" : "text-foreground-100",
          className,
        )}
      >
        {isClaimed ? (
          <CheckIcon className="bg-background-300 rounded-full p-0.5" />
        ) : (
          <GiftIcon
            variant="solid"
            className="bg-background-300 rounded-full p-0.5"
          />
        )}
        <p className="font-medium text-sm">{item}</p>
      </div>
    </CardListItem>
  );
});
