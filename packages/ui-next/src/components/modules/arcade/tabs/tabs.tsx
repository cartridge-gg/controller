import {
  ArcadeTabItem,
  ChestIcon,
  ClockIcon,
  cn,
  DotsIcon,
  LeaderboardIcon,
  PulseIcon,
  Select,
  SelectContent,
  SelectTrigger,
  SwordsIcon,
  Tabs,
  TabsList,
  TrophyIcon,
} from "@/index";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

      setVisibleTabs(newVisibleTabs);
      setOverflowTabs(newOverflowTabs);
    });

    observer.observe(containerRef.current!);
    return () => observer.disconnect();
  }, [order]);

  const renderTab = useCallback(
    (tab: string, item?: boolean) => {
      switch (tab) {
        case "discover":
          if (!discover) return null;
          return (
            <DiscoverNavButton
              key="discover"
              value="discover"
              active={active === "discover"}
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
              active={active === "inventory"}
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
              active={active === "achievements"}
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
              active={active === "leaderboard"}
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
              active={active === "guilds"}
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
              active={active === "activity"}
              size={size}
              onClick={onActivityClick}
              item={item}
            />
          );
        default:
          return null;
      }
    },
    [
      order,
      discover,
      inventory,
      achievements,
      leaderboard,
      guilds,
      activity,
      active,
      size,
      onDiscoverClick,
      onInventoryClick,
      onAchievementsClick,
      onLeaderboardClick,
      onGuildsClick,
      onActivityClick,
    ],
  );

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
          {order.map((tab) => renderTab(tab))}
        </div>
        {visibleTabs.map((tab) => renderTab(tab))}
        <Select>
          <div className="grow flex justify-end items-center self-center">
            <SelectTrigger
              className={cn(
                "h-8 w-8 p-0 flex items-center justify-center",
                overflowTabs.length === 0 && "hidden",
              )}
            >
              <DotsIcon
                data-active={overflowActive}
                size="xs"
                className="text-foreground-300 data-[active=true]:text-primary"
              />
            </SelectTrigger>
          </div>
          <SelectContent className="bg-background-100">
            {overflowTabs.map((tab) => renderTab(tab, true))}
          </SelectContent>
        </Select>
      </TabsList>
      {children}
    </Tabs>
  );
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
      <ArcadeTabItem
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
      <ArcadeTabItem
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
      <ArcadeTabItem
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
      <ArcadeTabItem
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
      <ArcadeTabItem
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
      <ArcadeTabItem
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
