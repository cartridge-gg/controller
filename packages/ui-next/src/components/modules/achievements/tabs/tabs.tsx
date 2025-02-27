import { Tabs, TabsList } from "#components/primitives";
import { AchievementTab } from "../tab/tab";
import { AchievementCounter } from "../counter/counter";
import { AchievementLeaderboardCounter } from "../leaderboard-counter/leaderboard-counter";
import { useState } from "react";

export interface AchievementTabsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  total: number;
  rank: number;
}

export const AchievementTabs = ({
  count,
  total,
  rank,
  className,
  children,
}: AchievementTabsProps) => {
  const [active, setActive] = useState("achievements");
  return (
    <Tabs
      className={className}
      defaultValue="achievements"
      onValueChange={setActive}
    >
      <TabsList className="h-[45px] grid w-full grid-cols-2 gap-x-4 bg-transparent p-0">
        <AchievementTab
          value="achievements"
          label="Achievements"
          counter={
            <AchievementCounter
              count={count}
              total={total}
              active={active === "achievements"}
            />
          }
          active={active === "achievements"}
        />
        <AchievementTab
          value="leaderboard"
          label="Leaderboard"
          counter={<AchievementLeaderboardCounter rank={rank} />}
          active={active === "leaderboard"}
        />
      </TabsList>
      {children}
    </Tabs>
  );
};
