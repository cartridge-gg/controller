import {
  Tabs,
  TabsList,
  AchievementTab,
  AchievementCounter,
  LeaderboardCounter,
} from "@/index";
import { useCallback, useState } from "react";

export interface AchievementTabsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  total: number;
  rank: number;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const AchievementTabs = ({
  count,
  total,
  rank,
  value,
  className,
  children,
  onValueChange,
}: AchievementTabsProps) => {
  const [active, setActive] = useState("achievements");
  const handleChange = useCallback(
    (value: string) => {
      setActive(value);
      onValueChange?.(value);
    },
    [setActive, onValueChange],
  );

  return (
    <Tabs className={className} value={value} onValueChange={handleChange}>
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
          counter={<LeaderboardCounter rank={rank} />}
          active={active === "leaderboard"}
        />
      </TabsList>
      {children}
    </Tabs>
  );
};

export default AchievementTabs;
