import { AchievementPlayerAvatar, cn } from "@/index";
import { useMemo } from "react";

export interface AchievementLeaderboardUsernameProps {
  username: string;
  icon?: string;
  highlight?: boolean;
  className?: string;
}

export const AchievementLeaderboardUsername = ({
  username,
  icon,
  highlight,
  className,
}: AchievementLeaderboardUsernameProps) => {
  const Icon = useMemo(() => {
    if (icon) return <div className={cn("h-4 w-4 fa-solid", icon)} />;
    return <AchievementPlayerAvatar username={username} className="h-4 w-4" />;
  }, [icon, username]);

  return (
    <div
      className={cn(
        "flex gap-1",
        highlight ? "text-primary" : "text-foreground-100",
        className,
      )}
    >
      <div className="h-5 w-5 flex items-center justify-center">{Icon}</div>
      <p className="text-sm">{username}</p>
    </div>
  );
};

export default AchievementLeaderboardUsername;
