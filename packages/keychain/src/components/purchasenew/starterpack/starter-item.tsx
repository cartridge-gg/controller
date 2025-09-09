import * as React from "react";
import { Card, CardContent, CardDescription, Thumbnail } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { Badge } from "./badge";
import { StarterPackItem, StarterPackItemType } from "@cartridge/controller";
import { usdcToUsd } from "@/utils/starterpack";

export const StarterItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    StarterPackItem & {
      contractAddress?: string;
    }
>(
  (
    { name, description, iconURL, type, className, price, amount, ...props },
    ref,
  ) => {
    return (
      <div className={cn("relative pt-1", className)} ref={ref} {...props}>
        <Card className="relative bg-background-100 overflow-visible h-[88px]">
          {/* Price tag */}
          <div className="absolute -top-1 right-4">
            {price !== 0n && <Badge price={price ? usdcToUsd(price) : 0} />}
          </div>
          <CardContent className="py-3 px-4 overflow-visible h-full rounded-lg flex flex-row items-center gap-3">
            {/* <img src={image} alt={title} className="size-16 object-cover" /> */}
            <Thumbnail
              rounded={type === StarterPackItemType.FUNGIBLE}
              icon={iconURL}
              variant="light"
              className="size-16 p-1"
            />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground-100 truncate">
                {type === StarterPackItemType.FUNGIBLE && amount
                  ? `${amount} Credits`
                  : name}
              </h3>
              <CardDescription className="font-normal text-xs text-foreground-200 line-clamp-2">
                {description}
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
);

StarterItem.displayName = "StarterItem";
