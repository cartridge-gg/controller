import {
  ChestIcon,
  ClockIcon,
  PulseIcon,
  SwordsIcon,
  Tabs,
  TabsList,
  TrophyIcon,
} from "@/index";
import { useState } from "react";
import { ArcadeTab } from "../tab";

export interface ArcadeTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  discover?: boolean;
  inventory?: boolean;
  achievements?: boolean;
  guilds?: boolean;
  activity?: boolean;
}

export const ArcadeTabs = ({
  discover,
  inventory,
  achievements,
  guilds,
  activity,
  className,
  children,
}: ArcadeTabsProps) => {
  const [active, setActive] = useState("discover");
  const [hover, setHover] = useState("");
  return (
    <Tabs
      className={className}
      defaultValue="discover"
      onValueChange={setActive}
    >
      <TabsList className="h-16 flex justify-between w-full gap-2 bg-background-100 p-0 pt-2 border-b border-spacer-100">
        {discover && (
          <DiscoverNavButton
            value="discover"
            active={active === "discover"}
            hover={hover === "discover"}
            onMouseEnter={() => setHover("discover")}
            onMouseLeave={() => setHover("")}
          />
        )}
        {inventory && (
          <InventoryNavButton
            value="inventory"
            active={active === "inventory"}
            hover={hover === "inventory"}
            onMouseEnter={() => setHover("inventory")}
            onMouseLeave={() => setHover("")}
          />
        )}
        {achievements && (
          <AchievementsNavButton
            value="achievements"
            active={active === "achievements"}
            hover={hover === "achievements"}
            onMouseEnter={() => setHover("achievements")}
            onMouseLeave={() => setHover("")}
          />
        )}
        {guilds && (
          <GuildsNavButton
            value="guilds"
            active={active === "guilds"}
            hover={hover === "guilds"}
            onMouseEnter={() => setHover("guilds")}
            onMouseLeave={() => setHover("")}
          />
        )}
        {activity && (
          <ActivityNavButton
            value="activity"
            active={active === "activity"}
            hover={hover === "activity"}
            onMouseEnter={() => setHover("activity")}
            onMouseLeave={() => setHover("")}
          />
        )}
      </TabsList>
      {children}
    </Tabs>
  );
};

const DiscoverNavButton = ({
  value,
  active,
  hover,
  onMouseEnter,
  onMouseLeave,
}: {
  value: string;
  active: boolean;
  hover: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={
        <PulseIcon
          variant={active || hover ? "solid" : "line"}
          size="default"
        />
      }
      label="Discover"
      active={active}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

const InventoryNavButton = ({
  value,
  active,
  hover,
  onMouseEnter,
  onMouseLeave,
}: {
  value: string;
  active: boolean;
  hover: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={
        <ChestIcon
          variant={active || hover ? "solid" : "line"}
          size="default"
        />
      }
      label="Inventory"
      active={active}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

const AchievementsNavButton = ({
  value,
  active,
  hover,
  onMouseEnter,
  onMouseLeave,
}: {
  value: string;
  active: boolean;
  hover: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={
        <TrophyIcon
          variant={active || hover ? "solid" : "line"}
          size="default"
        />
      }
      label="Achievements"
      active={active}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

const GuildsNavButton = ({
  value,
  active,
  hover,
  onMouseEnter,
  onMouseLeave,
}: {
  value: string;
  active: boolean;
  hover: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={
        <SwordsIcon
          variant={active || hover ? "solid" : "line"}
          size="default"
        />
      }
      label="Guilds"
      active={active}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

const ActivityNavButton = ({
  value,
  active,
  hover,
  onMouseEnter,
  onMouseLeave,
}: {
  value: string;
  active: boolean;
  hover: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={
        <ClockIcon
          variant={active || hover ? "solid" : "line"}
          size="default"
        />
      }
      label="Activity"
      active={active}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

export default ArcadeTabs;
