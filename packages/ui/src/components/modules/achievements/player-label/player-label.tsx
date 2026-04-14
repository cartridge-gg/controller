import { CopyAddress } from "@/components/copy-address";
import { BronzeTagIcon, GoldTagIcon, SilverTagIcon } from "@/components/icons";
import { AchievementPlayerBadge } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";

export interface AchievementPlayerLabelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementPlayerLabelVariants> {
  username: string;
  address: string;
  icon?: string;
}

const achievementPlayerLabelVariants = cva("flex items-center gap-x-4", {
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
  },
  defaultVariants: {
    variant: "default",
    rank: "default",
  },
});

export const AchievementPlayerLabel = ({
  username,
  address,
  icon,
  variant,
  rank,
  className,
  ...props
}: AchievementPlayerLabelProps) => {
  const TagIcon = useMemo(() => {
    switch (rank) {
      case "gold":
        return <GoldTagIcon size="sm" />;
      case "silver":
        return <SilverTagIcon size="sm" />;
      case "bronze":
        return <BronzeTagIcon size="sm" />;
      case "default":
      default:
        return null;
    }
  }, [rank]);

  return (
    <div
      className={cn(achievementPlayerLabelVariants({ variant }), className)}
      {...props}
    >
      <AchievementPlayerBadge
        icon={icon}
        variant={variant}
        rank={rank}
        username={username}
      />
      <div className="flex flex-col gap-y-0.5">
        <div className="flex items-center gap-x-2">
          <p className="text-lg/[22px] font-semibold text-foreground-100">
            {username}
          </p>
          {TagIcon}
        </div>
        <CopyAddress address={address} size="xs" />
      </div>
    </div>
  );
};

export default AchievementPlayerLabel;
