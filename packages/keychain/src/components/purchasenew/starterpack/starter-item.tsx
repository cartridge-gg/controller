import * as React from "react";
import { Card, CardContent, CardDescription, Thumbnail } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { StarterItemData, StarterItemType } from "@/hooks/starterpack";
import { Badge } from "./badge";

export const StarterItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StarterItemData
>(
  (
    {
      title,
      description,
      image,
      type,
      className,
      price,
      value,
      fancy = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative pt-1", className)} ref={ref} {...props}>
        <Card className="relative overflow-visible h-[88px] select-none">
          {/* Price tag */}
          <div className="absolute -top-1 right-4">
            {price !== 0 && !fancy && <Badge price={price} />}
          </div>
          <CardContent className="bg-background-200 hover:bg-background-300  py-3 px-4 overflow-visible h-full rounded-lg flex flex-row items-center gap-3">
            {/* <img src={image} alt={title} className="size-16 object-cover" /> */}
            <Thumbnail
              rounded={type === StarterItemType.CREDIT}
              icon={image}
              variant="light"
              className="size-16 p-1"
            />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex flex-row items-start justify-between self-stretch">
                <h3 className="text-sm font-medium text-foreground-100 truncate">
                  {type === StarterItemType.CREDIT && value
                    ? `${value} Credits`
                    : title}
                </h3>
                {fancy && (
                  <h3 className="text-sm font-medium text-foreground-100 truncate">
                    {`$${price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
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
