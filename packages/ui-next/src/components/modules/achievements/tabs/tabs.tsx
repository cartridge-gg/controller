import { cn, Tabs, TabsList } from "@/index";
import AchievementTab from "../tab/tab";
import AchievementCounter from "../counter/counter";
import AchievementLeaderboardCounter from "../leaderboard-counter/leaderboard-counter";

export const AchievementTabs = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <Tabs defaultValue="achievements">
      <TabsList
        className={cn(
          "h-auto grid w-full grid-cols-2 gap-x-4 bg-transparent p-0",
          className,
        )}
      >
        <AchievementTab
          value="achievements"
          label="Achievements"
          counter={<AchievementCounter count={4} total={10} />}
        />
        <AchievementTab
          value="leaderboard"
          label="Leaderboard"
          counter={<AchievementLeaderboardCounter rank={16} />}
        />
      </TabsList>
      <div {...props} />
    </Tabs>
  );
};

export default AchievementTabs;
