import {
  BronzeIcon,
  DefaultIcon,
  GoldIcon,
  SilverIcon,
  SpaceInvaderIcon,
} from "@/components/icons";
import { cn, Thumbnail } from "@/index";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes, useMemo } from "react";

export interface AchievementPlayerBadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementPlayerBadgeVariants> {
  icon?: React.ReactNode;
}

export const achievementPlayerBadgeVariants = cva(
  "relative flex justify-center items-center h-12 w-12",
  {
    variants: {
      variant: {
        default: "",
        gold: "",
        silver: "",
        bronze: "",
      },
      size: {
        xl: "",
        "2xl": "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xl",
    },
  },
);

export const AchievementPlayerBadge = ({
  icon,
  variant,
  size,
  className,
  children,
  ...props
}: AchievementPlayerBadgeProps) => {
  const BadgeIcon = useMemo(() => {
    switch (variant) {
      case "gold":
        return <GoldIcon className="absolute" size={size ?? "xl"} />;
      case "silver":
        return <SilverIcon className="absolute" size={size ?? "xl"} />;
      case "bronze":
        return <BronzeIcon className="absolute" size={size ?? "xl"} />;
      case "default":
      default:
        return <DefaultIcon className="absolute" size={size ?? "xl"} />;
    }
  }, [variant, size]);

  return (
    <div
      className={cn(achievementPlayerBadgeVariants({ variant }), className)}
      {...props}
    >
      <Thumbnail
        icon={icon ?? <SpaceInvaderIcon variant="solid" />}
        variant="faded"
        size="lg"
        className="rounded-full"
      />
      {BadgeIcon}
      {children}
    </div>
  );
};

export default AchievementPlayerBadge;
