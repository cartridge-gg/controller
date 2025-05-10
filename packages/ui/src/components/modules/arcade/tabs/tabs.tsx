import {
  ArcadeMenuButton,
  ArcadeMenuItem,
  ArcadeTab,
  ChestIcon,
  LeaderboardIcon,
  ListIcon,
  MetricsIcon,
  PulseIcon,
  Select,
  SelectContent,
  ShoppingCartIcon,
  SwordsIcon,
  Tabs,
  TabsList,
  TrophyIcon,
} from "@/index";
import { cn } from "@/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cva, VariantProps } from "class-variance-authority";

const arcadeTabsVariants = cva(
  "flex justify-start items-end w-full p-0 px-4 border-b rounded-none",
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

export type TabValue =
  | "inventory"
  | "achievements"
  | "leaderboard"
  | "guilds"
  | "activity"
  | "metrics"
  | "about"
  | "marketplace";

export interface ArcadeTabsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof arcadeTabsVariants> {
  defaultValue?: TabValue;
  order?: TabValue[];
  onTabClick?: (tab: TabValue) => void;
}

export const ArcadeTabs = ({
  defaultValue = "activity",
  order = [
    "activity",
    "leaderboard",
    "about",
    "metrics",
    "marketplace",
    "inventory",
    "achievements",
    "guilds",
  ],
  onTabClick,
  variant,
  size,
  className,
  children,
}: ArcadeTabsProps) => {
  const [active, setActive] = useState<TabValue>(defaultValue);
  const [visibleTabs, setVisibleTabs] = useState<TabValue[]>(order);
  const [overflowTabs, setOverflowTabs] = useState<TabValue[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(
    new Map<TabValue, { width: number; visible: boolean }>(),
  );

  useEffect(() => {
    if (!hiddenRef.current) return;
    const tabWidths = new Map<TabValue, { width: number; visible: boolean }>();
    hiddenRef.current.childNodes.forEach((node) => {
      const element = node as HTMLDivElement;
      const tab = element.textContent?.toLowerCase();
      if (tab) {
        const visible = order.includes(tab as TabValue);
        tabWidths.set(tab as TabValue, { width: element.offsetWidth, visible });
      }
    });
    tabRefs.current = tabWidths;
  }, [tabRefs, hiddenRef, order]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const gap = 12;
      const buttonWidth = 32;
      const availableWidth =
        containerRef.current.offsetWidth - buttonWidth - gap;
      let usedWidth = 32;
      const newVisibleTabs: TabValue[] = [];
      const newOverflowTabs: TabValue[] = [];

      order.forEach((tab) => {
        const { width, visible } = tabRefs.current.get(tab) || {
          width: 0,
          visible: false,
        };
        if (!visible) return;
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

      if (visibleTabs.join(",") !== newVisibleTabs.join(",")) {
        setVisibleTabs(newVisibleTabs);
      }
      if (overflowTabs.join(",") !== newOverflowTabs.join(",")) {
        setOverflowTabs(newOverflowTabs);
      }
    });

    observer.observe(containerRef.current!);
    return () => observer.disconnect();
  }, [order, containerRef.current, visibleTabs, overflowTabs, tabRefs]);

  const overflowActive = useMemo(
    () => overflowTabs.includes(active),
    [overflowTabs, active],
  );

  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={(value: string) => setActive(value as TabValue)}
      className="h-full flex flex-col overflow-hidden"
    >
      <TabsList
        ref={containerRef}
        className={cn(arcadeTabsVariants({ variant, size }), className)}
      >
        <div ref={hiddenRef} className="flex gap-2 absolute invisible">
          {order.map((tab) => (
            <Tab key={tab} tab={tab} value={active} size={size} />
          ))}
        </div>
        {visibleTabs.map((tab) => (
          <Tab
            key={tab}
            tab={tab}
            value={active}
            size={size}
            onTabClick={() => onTabClick?.(tab as TabValue)}
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
                value={active}
                size={size}
                onTabClick={() => onTabClick?.(tab as TabValue)}
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
  value,
  size,
  onTabClick,
  item,
}: {
  tab: TabValue;
  value: string;
  size: "default" | null | undefined;
  onTabClick?: () => void;
  item?: boolean;
}) => {
  const props = {
    key: tab,
    value: tab,
    active: value === tab,
    size,
    onClick: onTabClick,
    item,
  };
  switch (tab) {
    case "inventory":
      return <InventoryNavButton {...props} />;
    case "achievements":
      return <AchievementsNavButton {...props} />;
    case "leaderboard":
      return <LeaderboardNavButton {...props} />;
    case "guilds":
      return <GuildsNavButton {...props} />;
    case "activity":
      return <ActivityNavButton {...props} />;
    case "metrics":
      return <MetricsNavButton {...props} />;
    case "about":
      return <AboutNavButton {...props} />;
    case "marketplace":
      return <MarketplaceNavButton {...props} />;
    default:
      return null;
  }
};

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
        Icon={<PulseIcon variant="solid" size="sm" />}
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
      Icon={<PulseIcon variant="solid" size="sm" />}
      label="Activity"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const MetricsNavButton = React.forwardRef<
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
        Icon={<MetricsIcon variant="solid" size="sm" />}
        label="Metrics"
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
      Icon={<MetricsIcon variant="solid" size="sm" />}
      label="Metrics"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const AboutNavButton = React.forwardRef<
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
        Icon={<ListIcon variant="solid" size="sm" />}
        label="About"
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
      Icon={<ListIcon variant="solid" size="sm" />}
      label="About"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

const MarketplaceNavButton = React.forwardRef<
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
        Icon={<ShoppingCartIcon variant="solid" size="sm" />}
        label="Marketplace"
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
      Icon={<ShoppingCartIcon variant="solid" size="sm" />}
      label="Marketplace"
      active={active}
      size={size}
      onClick={onClick}
    />
  );
});

export default ArcadeTabs;
