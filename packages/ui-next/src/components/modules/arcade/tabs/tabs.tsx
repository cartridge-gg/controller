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
  defaultValue?: string;
  onDiscoverClick?: () => void;
  onInventoryClick?: () => void;
  onAchievementsClick?: () => void;
  onGuildsClick?: () => void;
  onActivityClick?: () => void;
}

export const ArcadeTabs = ({
  discover,
  inventory,
  achievements,
  guilds,
  activity,
  defaultValue = "discover",
  onDiscoverClick,
  onInventoryClick,
  onAchievementsClick,
  onGuildsClick,
  onActivityClick,
  className,
  children,
}: ArcadeTabsProps) => {
  const [active, setActive] = useState(defaultValue);
  return (
    <Tabs
      className={className}
      defaultValue={defaultValue}
      onValueChange={setActive}
    >
      <TabsList className="h-16 flex justify-start w-full gap-2 bg-background-100 p-0 pt-2 border-b border-spacer-100">
        {discover && (
          <DiscoverNavButton
            value="discover"
            active={active === "discover"}
            onClick={onDiscoverClick}
          />
        )}
        {inventory && (
          <InventoryNavButton
            value="inventory"
            active={active === "inventory"}
            onClick={onInventoryClick}
          />
        )}
        {achievements && (
          <AchievementsNavButton
            value="achievements"
            active={active === "achievements"}
            onClick={onAchievementsClick}
          />
        )}
        {guilds && (
          <GuildsNavButton
            value="guilds"
            active={active === "guilds"}
            onClick={onGuildsClick}
          />
        )}
        {activity && (
          <ActivityNavButton
            value="activity"
            active={active === "activity"}
            onClick={onActivityClick}
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
  onClick,
}: {
  value: string;
  active: boolean;
  onClick?: () => void;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={<PulseIcon variant="solid" size="default" />}
      label="Discover"
      active={active}
      onClick={onClick}
    />
  );
};

const InventoryNavButton = ({
  value,
  active,
  onClick,
}: {
  value: string;
  active: boolean;
  onClick?: () => void;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={<ChestIcon variant="solid" size="default" />}
      label="Inventory"
      active={active}
      onClick={onClick}
    />
  );
};

const AchievementsNavButton = ({
  value,
  active,
  onClick,
}: {
  value: string;
  active: boolean;
  onClick?: () => void;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={<TrophyIcon variant="solid" size="default" />}
      label="Achievements"
      active={active}
      onClick={onClick}
    />
  );
};

const GuildsNavButton = ({
  value,
  active,
  onClick,
}: {
  value: string;
  active: boolean;
  onClick?: () => void;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={<SwordsIcon variant="solid" size="default" />}
      label="Guilds"
      active={active}
      onClick={onClick}
    />
  );
};

const ActivityNavButton = ({
  value,
  active,
  onClick,
}: {
  value: string;
  active: boolean;
  onClick?: () => void;
}) => {
  return (
    <ArcadeTab
      value={value}
      Icon={<ClockIcon variant="solid" size="default" />}
      label="Activity"
      active={active}
      onClick={onClick}
    />
  );
};

export default ArcadeTabs;
