import {
  BronzeIcon,
  DefaultIcon,
  GoldIcon,
  SilverIcon,
} from "@/components/icons";
import { EmptyPfpIcon } from "@/components/icons/badge/empty";
import { AchievementPlayerAvatar, Thumbnail } from "@/index";
import { cn } from "@/utils";
import { VariantProps, cva } from "class-variance-authority";
import { HTMLAttributes, useMemo } from "react";

export interface AchievementPlayerBadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementPlayerBadgeVariants> {
  username?: string;
  icon?: React.ReactNode;
  badgeClassName?: string;
}

export const achievementPlayerBadgeVariants = cva(
  "relative flex justify-center items-center h-12 w-12",
  {
    variants: {
      variant: {
        darkest: "",
        darker: "",
        dark: "",
        default: "",
        light: "",
        lighter: "",
        lightest: "",
        ghost: "",
      },
      rank: {
        empty: "",
        default: "",
        gold: "",
        silver: "",
        bronze: "",
      },
      size: {
        "2xs": "",
        xs: "",
        sm: "",
        default: "",
        lg: "",
        xl: "",
        "2xl": "",
        "3xl": "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xl",
    },
  },
);

export const AchievementPlayerBadge = ({
  username,
  icon,
  variant,
  rank,
  size,
  className,
  badgeClassName,
  children,
  ...props
}: AchievementPlayerBadgeProps) => {
  const BadgeIcon = useMemo(() => {
    switch (rank) {
      case "empty":
        return (
          <EmptyPfpIcon
            className={cn("absolute text-primary", badgeClassName)}
            size={size ?? "xl"}
          />
        );
      case "gold":
        return (
          <GoldIcon
            className={cn("absolute text-primary", badgeClassName)}
            size={size ?? "xl"}
          />
        );
      case "silver":
        return (
          <SilverIcon
            className={cn("absolute text-primary", badgeClassName)}
            size={size ?? "xl"}
          />
        );
      case "bronze":
        return (
          <BronzeIcon
            className={cn("absolute text-primary", badgeClassName)}
            size={size ?? "xl"}
          />
        );
      case "default":
      default:
        return (
          <DefaultIcon
            className={cn("absolute text-primary", badgeClassName)}
            size={size ?? "xl"}
          />
        );
    }
  }, [rank, size, badgeClassName]);

  const ThumbnailIcon = useMemo(() => {
    if (icon) return icon;
    return (
      <AchievementPlayerAvatar
        username={username ?? ""}
        className="h-full w-full"
      />
    );
  }, [icon, username]);

  return (
    <div
      className={cn(
        achievementPlayerBadgeVariants({ variant, rank }),
        className,
      )}
      {...props}
    >
      <Thumbnail
        icon={ThumbnailIcon}
        variant={variant}
        size={
          size === "3xl"
            ? "xl"
            : size === "2xl"
              ? "lg"
              : size === "lg"
                ? "sm"
                : "md"
        }
        className="rounded-full"
        centered
        rounded
      />
      {BadgeIcon}
      {children}
    </div>
  );
};

export default AchievementPlayerBadge;
