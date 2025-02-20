import { Tabs, TabsList } from "@/index";
import AchievementTab from "../tab/tab";
import AchievementCounter from "../counter/counter";
import AchievementLeaderboardCounter from "../leaderboard-counter/leaderboard-counter";
import { useState } from "react";

export const AchievementTabs = ({
  className,
  children
}: React.HTMLAttributes<HTMLDivElement>) => {
  const [active, setActive] = useState("achievements");
  return (
    <Tabs className={className} defaultValue="achievements" onValueChange={setActive}>
      <TabsList
        className="h-[45px] grid w-full grid-cols-2 gap-x-4 bg-transparent p-0"
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
      {children}
    </Tabs>
  );
};

export default AchievementTabs;
