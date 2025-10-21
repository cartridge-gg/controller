import * as React from "react";
import { Card, CardContent, CardDescription, Thumbnail } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { Badge } from "./badge";
import { StarterPackItem, StarterPackItemType } from "@cartridge/controller";
import { usdcToUsd } from "@/utils/starterpack";
import { Item } from "@/context/purchase";

interface Props {
  containerClassName?: string;
  showPrice?: boolean;
  fancy?: boolean;
}

const isStarterPackItem = (
  item: StarterPackItem | Item,
): item is StarterPackItem => {
  return (item as StarterPackItem).name !== undefined;
};

const isPurchaseItem = (item: StarterPackItem | Item): item is Item => {
  return (item as Item).title !== undefined;
};

export const StarterItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & (StarterPackItem | Item) & Props
>(
  (
    {
      type,
      className,
      containerClassName,
      fancy = false,
      showPrice = true,
      ...props
    },
    ref,
  ) => {
    const item = props as StarterPackItem | Item;

    // Determine which type we're dealing with
    const starterPackItem = isStarterPackItem(item) ? item : null;
    const purchaseItem = isPurchaseItem(item) ? item : null;

    // Extract common properties with fallbacks
    const name = starterPackItem?.name || purchaseItem?.title || "";
    const description =
      starterPackItem?.description || purchaseItem?.subtitle || "";
    const icon = starterPackItem?.iconURL || purchaseItem?.icon || "";
    const price = starterPackItem?.price || 0n;

    return (
      <div
        className={cn("relative pt-1", containerClassName)}
        ref={ref}
        {...props}
      >
        <Card className="relative overflow-visible h-[88px] select-none">
          {/* Price tag */}
          <div className="absolute -top-1 right-4">
            {price !== 0n && fancy && (
              <Badge price={price ? usdcToUsd(price) : 0} />
            )}
          </div>
          <CardContent
            className={cn(
              "bg-background-200 py-3 px-4 overflow-visible h-full rounded-lg flex flex-row items-center gap-3",
              className,
            )}
          >
            <Thumbnail
              rounded={type === StarterPackItemType.FUNGIBLE}
              icon={icon}
              variant="light"
              className="size-16 p-1"
            />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex flex-row items-start justify-between self-stretch">
              <h3 className="text-sm font-medium text-foreground-100 truncate">
                {name}
              </h3>
                {price !== 0n && !fancy && showPrice && (
                  <h3 className="text-sm font-medium text-foreground-100 truncate">
                    {`$${usdcToUsd(price ? price : 0n).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}`}
                  </h3>
                )}
              </div>
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
