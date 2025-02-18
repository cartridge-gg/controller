import { cn, TabsTrigger } from "@/index";
import AchievementCounter from "../counter/counter";
import AchievementLeaderboardCounter from "../leaderboard-counter/leaderboard-counter";

export interface AchievementTabProps {
  value: string;
  label: string;
  counter:
    | ReturnType<typeof AchievementCounter>
    | ReturnType<typeof AchievementLeaderboardCounter>;
  className?: string;
}

export const AchievementTab = ({
  value,
  label,
  counter,
  className,
}: AchievementTabProps) => {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "select-none cursor-pointer flex justify-between items-center bg-background-100 border-b border-background-200 px-3 py-2.5 gap-4 grow text-foreground-300 hover:text-foreground-200",
        "data-[state=active]:bg-background-200 data-[state=active]:rounded data-[state=active]:cursor-default",
        "data-[state=active]:text-foreground-100 data-[state=active]:hover:text-foreground-100",
        className,
      )}
    >
      <p className="text-sm">{label}</p>
      {counter}
    </TabsTrigger>
  );
};

export default AchievementTab;
