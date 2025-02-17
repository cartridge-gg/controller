import { cn } from "@/index";

export interface AchievementLeaderboardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const AchievementLeaderboard = ({
  className,
  ...props
}: AchievementLeaderboardProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-y-px rounded overflow-y-scroll",
        className,
      )}
      style={{
        scrollbarWidth: "none",
      }}
      {...props}
    />
  );
};

export default AchievementLeaderboard;
