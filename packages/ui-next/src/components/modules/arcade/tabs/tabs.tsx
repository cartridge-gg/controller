import {
  ArcadeMenuButton,
  ArcadeMenuItem,
  ChestIcon,
  ClockIcon,
  cn,
  LeaderboardIcon,
  PulseIcon,
  Select,
  SelectContent,
  SwordsIcon,
  Tabs,
  TabsList,
  TrophyIcon,
} from "@/index";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArcadeTab } from "../tab";
import { cva, VariantProps } from "class-variance-authority";

const arcadeTabsVariants = cva(
  "flex justify-start items-end w-full p-0 border-b rounded-none",
  {
    variants: {
      variant: {
        default: "bg-background-100 border-background-200",
      },
      size: {
        default: "gap-3 h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ArcadeTabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeTabsVariants> {
  discover?: boolean;
  inventory?: boolean;
  achievements?: boolean;
  leaderboard?: boolean;
  guilds?: boolean;
  activity?: boolean;
  defaultValue?: string;
  order?: string[];
  onDiscoverClick?: () => void;
  onInventoryClick?: () => void;
  onAchievementsClick?: () => void;
  onLeaderboardClick?: () => void;
  onGuildsClick?: () => void;
  onActivityClick?: () => void;
}

export const ArcadeTabs = ({
  discover,
  inventory,
  achievements,
  leaderboard,
  guilds,
  activity,
  defaultValue = "discover",
  order = [
    "discover",
    "inventory",
    "achievements",
    "leaderboard",
    "guilds",
    "activity",
  ],
  onDiscoverClick,
  onInventoryClick,
  onAchievementsClick,
  onLeaderboardClick,
  onGuildsClick,
  onActivityClick,
  variant,
  size,
  className,
  children,
}: ArcadeTabsProps) => {
  const [active, setActive] = useState(defaultValue);
  const [visibleTabs, setVisibleTabs] = useState(order);
  const [overflowTabs, setOverflowTabs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<string, number>());

  useEffect(() => {
    if (!hiddenRef.current) return;
    const tabWidths = new Map<string, number>();
    hiddenRef.current.childNodes.forEach((node) => {
      const element = node as HTMLDivElement;
      const tab = element.textContent?.toLowerCase();
      if (tab) {
        tabWidths.set(tab, element.offsetWidth);
      }
    });
    tabRefs.current = tabWidths;
  }, [order, discover, inventory, achievements, guilds, activity]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const gap = 12;
      const buttonWidth = 32;
      const availableWidth =
        containerRef.current.offsetWidth - buttonWidth - gap;
      let usedWidth = 0;
      const newVisibleTabs: string[] = [];
      const newOverflowTabs: string[] = [];

      order.forEach((tab) => {
        const width = tabRefs.current.get(tab) || 100;
        if (
          usedWidth + width <= availableWidth &&
          newOverflowTabs.length === 0
        ) {
          newVisibleTabs.push(tab);
          usedWidth += width + gap;
        } else {
          newOverflowTabs.push(tab);
        }
      });

      if (visibleTabs.length !== newVisibleTabs.length) {
        setVisibleTabs(newVisibleTabs);
      }
      if (overflowTabs.length !== newOverflowTabs.length) {
        setOverflowTabs(newOverflowTabs);
      }
    });

    observer.observe(containerRef.current!);
    return () => observer.disconnect();
  }, [order, containerRef.current, visibleTabs, overflowTabs]);

  const overflowActive = useMemo(
    () => overflowTabs.includes(active),
    [overflowTabs, active],
  );

  return (
    <Tabs defaultValue={defaultValue} onValueChange={setActive}>
      <TabsList
        ref={containerRef}
        className={cn(arcadeTabsVariants({ variant, size }), className)}
      >
        <div ref={hiddenRef} className="flex gap-2 absolute invisible">
          {order.map((tab) => (
            <Tab
              key={tab}
              tab={tab}
              discover={!!discover}
              inventory={!!inventory}
              achievements={!!achievements}
              leaderboard={!!leaderboard}
              guilds={!!guilds}
              activity={!!activity}
              value={active}
              size={size}
              onDiscoverClick={onDiscoverClick}
              onInventoryClick={onInventoryClick}
              onAchievementsClick={onAchievementsClick}
              onLeaderboardClick={onLeaderboardClick}
              onGuildsClick={onGuildsClick}
              onActivityClick={onActivityClick}
            />
          ))}
        </div>
        {visibleTabs.map((tab) => (
          <Tab
            key={tab}
            tab={tab}
            discover={!!discover}
            inventory={!!inventory}
            achievements={!!achievements}
            leaderboard={!!leaderboard}
            guilds={!!guilds}
            activity={!!activity}
            value={active}
            size={size}
            onDiscoverClick={onDiscoverClick}
            onInventoryClick={onInventoryClick}
            onAchievementsClick={onAchievementsClick}
            onLeaderboardClick={onLeaderboardClick}
            onGuildsClick={onGuildsClick}
            onActivityClick={onActivityClick}
          />
        ))}
        <Select>
          <div className="grow flex justify-end items-center self-center">
            <ArcadeMenuButton
              active={overflowActive}
              className={cn(overflowTabs.length === 0 && "hidden")}
            />
          </div>
          <SelectContent className="bg-background-100">
            {overflowTabs.map((tab) => (
              <Tab
                key={tab}
                tab={tab}
                discover={!!discover}
                inventory={!!inventory}
                achievements={!!achievements}
                leaderboard={!!leaderboard}
                guilds={!!guilds}
                activity={!!activity}
                value={active}
                size={size}
                onDiscoverClick={onDiscoverClick}
                onInventoryClick={onInventoryClick}
                onAchievementsClick={onAchievementsClick}
                onLeaderboardClick={onLeaderboardClick}
                onGuildsClick={onGuildsClick}
                onActivityClick={onActivityClick}
                item={true}
              />
            ))}
          </SelectContent>
        </Select>
      </TabsList>
      {children}
    </Tabs>
  );
};

const Tab = ({
  tab,
  discover,
  inventory,
  achievements,
  leaderboard,
  guilds,
  activity,
  value,
  size,
  onDiscoverClick,
  onInventoryClick,
  onAchievementsClick,
  onLeaderboardClick,
  onGuildsClick,
  onActivityClick,
  item,
}: {
  tab: string;
  discover: boolean;
  inventory: boolean;
  achievements: boolean;
  leaderboard: boolean;
  guilds: boolean;
  activity: boolean;
  value: string;
  size: "default" | null | undefined;
  onDiscoverClick?: () => void;
  onInventoryClick?: () => void;
  onAchievementsClick?: () => void;
  onLeaderboardClick?: () => void;
  onGuildsClick?: () => void;
  onActivityClick?: () => void;
  item?: boolean;
}) => {
  switch (tab) {
    case "discover":
      if (!discover) return null;
      return (
        <DiscoverNavButton
          key="discover"
          value="discover"
          active={value === "discover"}
          size={size}
          onClick={onDiscoverClick}
          item={item}
        />
      );
    case "inventory":
      if (!inventory) return null;
      return (
        <InventoryNavButton
          key="inventory"
          value="inventory"
          active={value === "inventory"}
          size={size}
          onClick={onInventoryClick}
          item={item}
        />
      );
    case "achievements":
      if (!achievements) return null;
      return (
        <AchievementsNavButton
          key="achievements"
          value="achievements"
          active={value === "achievements"}
          size={size}
          onClick={onAchievementsClick}
          item={item}
        />
      );
    case "leaderboard":
      if (!leaderboard) return null;
      return (
        <LeaderboardNavButton
          key="leaderboard"
          value="leaderboard"
          active={value === "leaderboard"}
          size={size}
          onClick={onLeaderboardClick}
          item={item}
        />
      );
    case "guilds":
      if (!guilds) return null;
      return (
        <GuildsNavButton
          key="guilds"
          value="guilds"
          active={value === "guilds"}
          size={size}
          onClick={onGuildsClick}
          item={item}
        />
      );
    case "activity":
      if (!activity) return null;
      return (
        <ActivityNavButton
          key="activity"
          value="activity"
          active={value === "activity"}
          size={size}
          onClick={onActivityClick}
          item={item}
        />
      );
    default:
      return null;
  }
};

const DiscoverNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<PulseIcon variant="solid" size="sm" />}
        label="Discover"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<PulseIcon variant="solid" size="sm" />}
      label="Discover"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const InventoryNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<ChestIcon variant="solid" size="sm" />}
        label="Inventory"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<ChestIcon variant="solid" size="sm" />}
      label="Inventory"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const AchievementsNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<TrophyIcon variant="solid" size="sm" />}
        label="Achievements"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<TrophyIcon variant="solid" size="sm" />}
      label="Achievements"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const LeaderboardNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<LeaderboardIcon variant="solid" size="sm" />}
        label="Leaderboard"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<LeaderboardIcon variant="solid" size="sm" />}
      label="Leaderboard"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const GuildsNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<SwordsIcon variant="solid" size="sm" />}
        label="Guilds"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<SwordsIcon variant="solid" size="sm" />}
      label="Guilds"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const ActivityNavButton = React.forwardRef<
  HTMLButtonElement,
  {
    value: string;
    active: boolean;
    size: "default" | null | undefined;
    onClick?: () => void;
    item?: boolean;
  }
>(({ value, active, size, onClick, item }, ref) => {
  if (item) {
    return (
      <ArcadeMenuItem
        ref={ref}
        value={value}
        Icon={<ClockIcon variant="solid" size="sm" />}
        label="Activity"
        active={active}
        size={size}
        onClick={onClick}
      />
    );
  }
  return (
    <ArcadeTab
      ref={ref}
      value={value}
      Icon={<ClockIcon variant="solid" size="sm" />}
      label="Activity"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

export default ArcadeTabs;
