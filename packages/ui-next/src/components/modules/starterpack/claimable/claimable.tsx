import {
  Card,
  CardHeader,
  CardListContent,
  CardTitle,
} from "@/components/primitives";
import { cn } from "@/utils";
import React from "react";
import { StarterpackCard } from "../card";

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
        {items.map((item, i) => (
          <StarterpackCard key={i} item={item} isClaimed={isClaimed} />
        ))}
      </CardListContent>
    </Card>
  );
});

StarterpackClaimable.displayName = "StarterPackClaimable";
