import {
  ChestIcon,
  ClockIcon,
  PulseIcon,
  SwordsIcon,
  TrophyIcon,
} from "#components/icons";
import { Tabs, TabsList } from "#components/primitives";
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
  return (
    <Tabs
      className={className}
      defaultValue="discover"
      onValueChange={setActive}
    >
      <TabsList className="h-16 flex justify-between w-full gap-2 bg-background-100 p-0 pt-2 border-b border-spacer-100">
        {discover && (
          <DiscoverNavButton value="discover" active={active === "discover"} />
        )}
        {inventory && (
          <InventoryNavButton
            value="inventory"
            active={active === "inventory"}
          />
        )}
        {achievements && (
          <AchievementsNavButton
            value="achievements"
            active={active === "achievements"}
          />
        )}
        {guilds && (
          <GuildsNavButton value="guilds" active={active === "guilds"} />
        )}
        {activity && (
          <ActivityNavButton value="activity" active={active === "activity"} />
        )}
      </TabsList>
      {children}
    </Tabs>
  );
};

const DiscoverNavButton = ({
  value,
  active,
}: {
  value: string;
  active: boolean;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={<PulseIcon variant="solid" size="default" />}
      label="Discover"
      active={active}
    />
  );
};

const InventoryNavButton = ({
  value,
  active,
}: {
  value: string;
  active: boolean;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={<ChestIcon variant="solid" size="default" />}
      label="Inventory"
      active={active}
    />
  );
};

const AchievementsNavButton = ({
  value,
  active,
}: {
  value: string;
  active: boolean;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={<TrophyIcon variant="solid" size="default" />}
      label="Achievements"
      active={active}
    />
  );
};

const GuildsNavButton = ({
  value,
  active,
}: {
  value: string;
  active: boolean;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={<SwordsIcon variant="solid" size="default" />}
      label="Guilds"
      active={active}
    />
  );
};

const ActivityNavButton = ({
  value,
  active,
}: {
  value: string;
  active: boolean;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={<ClockIcon variant="solid" size="default" />}
      label="Activity"
      active={active}
    />
  );
};

export default ArcadeTabs;
