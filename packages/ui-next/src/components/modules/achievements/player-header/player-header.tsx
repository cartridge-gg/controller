import { useMemo } from "react";
import { AchievementPlayerLabel } from "../player-label";

interface AchievementPlayerHeaderProps {
  username: string;
  address: string;
  points: number;
  icon?: string;
  follower?: boolean;
  followers?: string[];
}

export const AchievementPlayerHeader = ({
  username,
  address,
  points,
  icon,
  follower,
  followers,
}: AchievementPlayerHeaderProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      <AchievementPlayerLabel
        username={username}
        address={address}
        icon={icon}
      />
      <div className="flex flex-col">
        <div className="h-6 flex items-center gap-x-2">
          <p className="text-xs text-foreground-300 flex items-center gap-x-1">
            <strong className="font-medium text-foreground-100">
              {followers?.length?.toLocaleString() || 0}
            </strong>
            Followers
          </p>
          <p className="text-xs text-foreground-300 flex items-center gap-x-1">
            <strong className="font-medium text-foreground-100">
              {points.toLocaleString()}
            </strong>
            Points
          </p>
          {follower && <FollowerTag />}
        </div>
        <FollowerDescription followers={followers || []} />
      </div>
    </div>
  );
};

const FollowerTag = () => {
  return (
    <p className="bg-background-100 border border-background-200 rounded px-1.5 py-0.5 text-xs text-foreground-400">
      Follows you
    </p>
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
