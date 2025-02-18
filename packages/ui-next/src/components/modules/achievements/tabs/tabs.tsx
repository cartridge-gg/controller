import { Tabs, TabsList } from "@/index";
import AchievementTab from "../tab/tab";
import AchievementCounter from "../counter/counter";
import AchievementLeaderboardCounter from "../leaderboard-counter/leaderboard-counter";

export interface AchievementTabsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const AchievementTabs = ({
  className,
  ...props
}: AchievementTabsProps) => {
  return (
    <Tabs defaultValue="achievements">
      <TabsList className="h-auto grid w-full grid-cols-2 gap-x-4 bg-transparent p-0">
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
