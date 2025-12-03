import * as React from "react";
import { Card, CardContent, CardDescription, Thumbnail } from "@cartridge/ui";
import { cn } from "@cartridge/ui/utils";
import { Item, ItemType } from "@/context";

interface Props {
  containerClassName?: string;
  showPrice?: boolean;
  fancy?: boolean;
}

export const StarterItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & Item & Props
>(({ className, containerClassName, ...props }, ref) => {
  const item = props as Item;

  // Determine if thumbnail should be rounded
  const isRounded = item
    ? item.type === ItemType.CREDIT || item.type === ItemType.ERC20
    : false;

  return (
    <div
      className={cn("relative pt-1", containerClassName)}
      ref={ref}
      {...props}
    >
      <Card className="relative overflow-visible h-[88px] select-none">
        <CardContent
          className={cn(
            "bg-background-200 py-3 px-4 overflow-visible h-full rounded-lg flex flex-row items-center gap-3",
            className,
          )}
        >
          <Thumbnail
            rounded={isRounded}
            icon={item.icon}
            variant="light"
            className="size-16 p-1"
          />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex flex-row items-start justify-between self-stretch">
              <h3 className="text-sm font-medium text-foreground-100 truncate">
                {item.title}
              </h3>
            </div>
            <CardDescription className="font-normal text-xs text-foreground-200 line-clamp-2">
              {item.subtitle}
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

StarterItem.displayName = "StarterItem";
