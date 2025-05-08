import { AchievementPlayerAvatar } from "@/index";
import { cn } from "@/utils";

export interface LeaderboardUsernameProps {
  username: string;
  icon?: string;
  highlight?: boolean;
  className?: string;
}

export const LeaderboardUsername = ({
  username,
  icon,
  highlight,
  className,
}: LeaderboardUsernameProps) => {
  return (
    <div
      className={cn(
        "flex gap-1",
        highlight ? "text-primary" : "text-foreground-100",
        className,
      )}
    >
      <div className="h-5 w-5 flex items-center justify-center">
        {icon ? (
          <div className={cn("h-4 w-4 fa-solid", icon)} />
        ) : (
          <AchievementPlayerAvatar username={username} size="sm" />
        )}
      </div>
      <p className="text-sm truncate max-w-28 lg:max-w-none lg:truncate-none">
        {username}
      </p>
    </div>
  );
};

export default LeaderboardUsername;
