import { HTMLAttributes, useMemo } from "react";
import { AchievementPlayerLabel } from "../player-label";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
import { FollowerTag } from "@/index";

interface AchievementPlayerHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof achievementPlayerHeaderVariants> {
  username: string;
  address: string;
  points: number;
  icon?: string;
  follower?: boolean;
  followerCount?: number;
  followingCount?: number;
  followers?: string[];
  compacted?: boolean;
}

const achievementPlayerHeaderVariants = cva("flex flex-col gap-y-4", {
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

export const AchievementPlayerHeader = ({
  username,
  address,
  points,
  icon,
  follower,
  followerCount,
  followingCount,
  followers,
  compacted,
  variant,
  rank,
  className,
  ...props
}: AchievementPlayerHeaderProps) => {
  return (
    <div
      className={cn(
        achievementPlayerHeaderVariants({ variant, rank }),
        className,
      )}
      {...props}
    >
      <AchievementPlayerLabel
        username={username}
        address={address}
        icon={icon}
        variant="default"
        rank={rank}
      />
      <div className="flex flex-col">
        <div className="h-6 flex items-center gap-x-2">
          <p className="text-xs text-foreground-300 flex items-center gap-x-1">
            <strong className="font-medium text-foreground-100">
              {followerCount?.toLocaleString() || 0}
            </strong>
            Followers
          </p>
          <p className="text-xs text-foreground-300 flex items-center gap-x-1">
            <strong className="font-medium text-foreground-100">
              {followingCount?.toLocaleString() || 0}
            </strong>
            Following
          </p>
          <p className="text-xs text-foreground-300 flex items-center gap-x-1">
            <strong className="font-medium text-foreground-100">
              {points.toLocaleString()}
            </strong>
            Points
          </p>
          {follower && <FollowerTag variant={variant} />}
        </div>
        {!compacted && <FollowerDescription followers={followers || []} />}
      </div>
    </div>
  );
};

const FollowerDescription = ({ followers }: { followers: string[] }) => {
  const description = useMemo(() => {
    const names = followers.slice(0, 2);
    if (followers.length > 3) {
      return `Followed by ${names.join(", ")} and ${followers.length - 2} others you follow`;
    } else if (followers.length === 3) {
      return `Followed by ${names.join(", ")} and ${followers.length - 2} other you follow`;
    } else if (followers.length > 0) {
      return `Followed by ${names.join(" and ")}`;
    } else {
      return `Followed by no one you follow`;
    }
  }, [followers]);

  return (
    <p className="h-6 flex items-center text-xs text-foreground-300">
      {description}
    </p>
  );
};

export default AchievementPlayerHeader;
