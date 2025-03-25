import { GiftIcon, CheckIcon } from "@/components/icons";
import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
} from "@/components/primitives";
import { cn } from "@/utils";
import React from "react";

export interface StarterpackClaimableProps {
  items: Array<string>;
  isClaimed?: boolean;
}

export const StarterpackClaimable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StarterpackClaimableProps
>(({ items, isClaimed = false, className, ...props }, ref) => {
  return (
    <Card className={cn(className)} {...props} ref={ref}>
      <CardHeader className="py-2.5 px-3">
        <CardTitle className="normal-case font-semibold text-xs w-full flex items-center justify-between">
          <span>{isClaimed ? "Claimed" : "Claimable"}</span>
          <div className="bg-background-300 py-0.5 px-1.5 rounded-full">
            <span className="text-foreground-300">{items.length} total</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardListContent>
        {items.map((item) => (
          <CardListItem className="flex flex-row items-center py-2 px-3">
            <div
              className={cn(
                "flex flex-row items-center gap-3 text-foreground-100",
                isClaimed ? "text-foreground-400" : "text-foreground-100",
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
        ))}
      </CardListContent>
    </Card>
  );
});

StarterpackClaimable.displayName = "StarterPackClaimable";
