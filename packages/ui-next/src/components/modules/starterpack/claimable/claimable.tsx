import { GiftIcon } from "@/components/icons";
import {
  Card,
  CardHeader,
  CardListContent,
  CardListItem,
  CardTitle,
} from "@/components/primitives";
import { cn } from "@/utils";
import React from "react";

export interface StarterPackClaimableProps {
  icon?: React.ReactElement;
  items: Array<string>;
}

export const StarterPackClaimable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StarterPackClaimableProps
>(({ icon, items, className, ...props }, ref) => {
  return (
    <Card className={cn(className)} {...props} ref={ref}>
      <CardHeader className="py-2.5 px-3">
        <CardTitle className="normal-case font-semibold text-xs w-full flex items-center justify-between">
          <span>Claimable</span>
          <div className="bg-background-300 py-0.5 px-1.5 rounded-full">
            <span className="text-foreground-300">{items.length} total</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardListContent>
        {items.map((item) => (
          <CardListItem className="flex flex-row items-center py-2 px-3">
            <div className="flex flex-row items-center gap-3">
              {icon ?? (
                <GiftIcon
                  variant="solid"
                  className="bg-background-300 rounded-full p-0.5"
                />
              )}
              <div className="flex flex-col gap-0.5">
                <p className="text-foreground-100 font-medium text-sm">
                  {item}
                </p>
              </div>
            </div>
          </CardListItem>
        ))}
      </CardListContent>
    </Card>
  );
});

StarterPackClaimable.displayName = "StarterPackClaimable";
