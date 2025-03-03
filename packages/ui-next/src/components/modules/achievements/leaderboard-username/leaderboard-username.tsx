import { cn } from "#utils";

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
  return (
    <div
      className={cn(
        "flex gap-1",
        highlight ? "text-primary" : "text-foreground-100",
        className,
      )}
    >
      <div className="h-5 w-5 flex items-center justify-center">
        <div className={cn("h-4 w-4 fa-solid", icon || "fa-alien-8bit")} />
      </div>
      <p className="text-sm">{username}</p>
    </div>
  );
};
