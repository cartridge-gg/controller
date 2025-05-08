import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  cn,
  Thumbnail,
} from "@cartridge/ui-next";
import { StarterItemData, StarterItemType } from "@/hooks/starterpack";

export const StarterItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StarterItemData
>(
  (
    { title, description, image, type, className, price, value, ...props },
    ref,
  ) => {
    return (
      <div className={cn("relative pt-1", className)} ref={ref} {...props}>
        <Card className="relative bg-background-100 overflow-visible h-[88px]">
          {/* Price tag */}
          <div className="absolute -top-1 right-4">
            <Union price={price} />
          </div>
          <CardContent className="py-3 px-4 overflow-visible h-full rounded-lg flex flex-row items-center gap-3">
            {/* <img src={image} alt={title} className="size-16 object-cover" /> */}
            <Thumbnail
              rounded={type === StarterItemType.CREDIT}
              icon={image}
              variant="light"
              className="size-16 p-1"
            />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground-100 truncate">
                {type === StarterItemType.CREDIT && value
                  ? `${value} Credits`
                  : price === 0
                    ? "FREE"
                    : title}
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

const Union = ({ price }: { price: number }) => {
  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="48"
        height="36"
        viewBox="0 0 48 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.4375 0C1.09131 0 0 0.820418 0 1.83245V35.0824C0 35.7832 1.00383 36.2246 1.81626 35.881L23.4 28.6557C23.5855 28.5772 23.794 28.538 24 28.538C24.206 28.538 24.4145 28.5772 24.6 28.6557L46.1837 35.881C46.9962 36.2246 48 35.7832 48 35.0824V1.83245C48 0.820417 46.9087 0 45.5625 0H2.4375Z"
          fill="url(#paint0_linear_9891_43627)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_9891_43627"
            x1="24"
            y1="0"
            x2="24"
            y2="36"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2A2F2A" />
            <stop offset="1" stopColor="#242824" />
          </linearGradient>
        </defs>
      </svg>
      <span
        className={cn(
          "absolute font-semibold text-sm -translate-y-1/4",
          price === 0 ? "text-constructive-100" : "text-primary-200",
        )}
      >
        {price === 0 ? "FREE" : `$${price}`}
      </span>
    </div>
  );
};
