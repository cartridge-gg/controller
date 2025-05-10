import {
  BronzeIcon,
  DefaultIcon,
  GoldIcon,
  SilverIcon,
} from "@/components/icons";
import { AchievementPlayerAvatar, Thumbnail } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes, useMemo } from "react";

export interface AchievementPlayerBadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementPlayerBadgeVariants> {
  username?: string;
  icon?: React.ReactNode;
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
        default: "",
        gold: "",
        silver: "",
        bronze: "",
      },
      size: {
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
  children,
  ...props
}: AchievementPlayerBadgeProps) => {
  const BadgeIcon = useMemo(() => {
    switch (rank) {
      case "gold":
        return (
          <GoldIcon className="absolute text-primary" size={size ?? "xl"} />
        );
      case "silver":
        return (
          <SilverIcon className="absolute text-primary" size={size ?? "xl"} />
        );
      case "bronze":
        return (
          <BronzeIcon className="absolute text-primary" size={size ?? "xl"} />
        );
      case "default":
      default:
        return (
          <DefaultIcon className="absolute text-primary" size={size ?? "xl"} />
        );
    }
  }, [rank, size]);

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
        size={size === "3xl" ? "xl" : size === "2xl" ? "lg" : "md"}
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
