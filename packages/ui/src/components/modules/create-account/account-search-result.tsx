import {
  AchievementPlayerAvatar,
  AchievementPlayerBadge,
  PlusIcon,
  SeedlingIcon,
  SparklesIcon,
} from "@/index";
import { cn } from "@/utils";
import { AccountSearchResult } from "@/utils/hooks/useAccountSearch";
import { VariantProps, cva } from "class-variance-authority";
import React, { HTMLAttributes } from "react";

const accountSearchResultVariants = cva(
  "h-12 px-3 py-1 flex gap-1 items-center select-none cursor-pointer transition-colors duration-150 relative",
  {
    variants: {
      variant: {
        default:
          "bg-background-200 hover:bg-background-300 text-foreground-100",
        selected: "bg-background-400 text-foreground-100",
        "create-new":
          "bg-background-200 hover:bg-background-300 text-foreground-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface AccountSearchResultItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "id">,
    VariantProps<typeof accountSearchResultVariants> {
  result: AccountSearchResult;
  isSelected?: boolean;
}

export const AccountSearchResultItem = React.forwardRef<
  HTMLDivElement,
  AccountSearchResultItemProps
>(({ result, isSelected, className, ...props }, ref) => {
  const selectedVariant = isSelected
    ? "selected"
    : result.type === "create-new"
      ? "create-new"
      : "default";

  if (result.type === "create-new") {
    return (
      <div
        ref={ref}
        className={cn(
          "h-12 px-3 py-1 flex items-center gap-1.5 select-none cursor-pointer transition-colors duration-150",
          isSelected
            ? "bg-background-400"
            : "bg-background-200 hover:bg-background-300",
          className,
        )}
        {...props}
      >
        {/* User icon container with plus and dotted border - matching Figma design */}
        <AchievementPlayerBadge
          rank="empty"
          icon={<PlusIcon variant="line" className="text-foreground-100" />}
          variant="ghost"
          size="lg"
          className="!w-8 !h-8"
          badgeClassName="text-foreground-400"
        />

        {/* Username text */}
        <p className="flex-1 justify-center text-foreground-100 text-sm font-normal leading-tight">
          {result.username}
        </p>

        {/* Create New tag with seedling icon */}
        <div className="flex items-start gap-2.5 p-2">
          <div className="p-1 bg-background-300 rounded inline-flex justify-center items-center gap-0.5">
            <div className="flex justify-start items-center gap-0.5">
              <SeedlingIcon
                variant="solid"
                className="text-primary"
                size="xs"
              />
            </div>
            <div className="px-0.5 flex justify-center items-center gap-2.5">
              <p className="text-center justify-center text-primary text-xs font-normal leading-none">
                Create New
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        accountSearchResultVariants({ variant: selectedVariant }),
        className,
      )}
      {...props}
    >
      <AchievementPlayerBadge
        icon={
          <AchievementPlayerAvatar
            username={result.username}
            className="!h-5 !w-5"
          />
        }
        variant="ghost"
        size="lg"
        className="!w-8 !h-8"
      />
      <div className="flex flex-row items-center justify-between gap-1 flex-1">
        <p className="text-sm font-normal px-0.5 truncate">{result.username}</p>

        {result.points ? (
          <div className="flex items-start gap-2.5 p-2">
            <div className="flex items-center justify-center gap-0.5 p-1 bg-background-300 rounded text-foreground-100">
              <SparklesIcon
                variant="solid"
                size="xs"
                className="text-foreground-100"
              />
              <div className="flex items-center gap-1">
                <p className="text-xs font-medium text-foreground-100">
                  {result.points?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
});

AccountSearchResultItem.displayName = "AccountSearchResultItem";

export default AccountSearchResultItem;
