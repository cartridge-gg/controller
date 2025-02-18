import { cn, Tabs, TabsList } from "@/index";
import AchievementTab from "../tab/tab";
import AchievementCounter from "../counter/counter";
import AchievementLeaderboardCounter from "../leaderboard-counter/leaderboard-counter";
import { useState } from "react";

export const AchievementTabs = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const [active, setActive] = useState("achievements");
  return (
    <Tabs defaultValue="achievements" onValueChange={setActive}>
      <TabsList
        className={cn(
          "h-auto grid w-full grid-cols-2 gap-x-4 bg-transparent p-0",
          className,
        )}
      >
        <AchievementTab
          value="achievements"
          label="Achievements"
          counter={<AchievementCounter count={4} total={10} active />}
          active={active === "achievements"}
        />
        <AchievementTab
          value="leaderboard"
          label="Leaderboard"
          counter={<AchievementLeaderboardCounter rank={16} />}
          active={active === "leaderboard"}
        />
      </TabsList>
      <div {...props} />
    </Tabs>
  );
};

export default AchievementTabs;
