import {
  cn,
  LeaderboardIcon,
  SparklesIcon,
  StateIconProps,
  TrophyIcon,
} from "@cartridge/ui-next";
import { useState } from "react";

export function TrophiesTab({
  active,
  completed,
  total,
  onClick,
}: {
  active: boolean;
  completed: number;
  total: number;
  onClick: () => void;
}) {
  return (
    <Tab active={active} onClick={onClick}>
      <Item Icon={TrophyIcon} active={active} label={"Trophies"} />
      <p className="bg-accent text-xs rounded-2xl px-2 py-1 font-bold">
        {`${completed}/${total}`}
      </p>
    </Tab>
  );
}

export function LeaderboardTab({
  active,
  rank,
  earnings,
  onClick,
}: {
  active: boolean;
  rank: number;
  earnings: number;
  onClick: () => void;
}) {
  return (
    <Tab active={active} onClick={onClick}>
      <Item
        Icon={LeaderboardIcon}
        active={active}
        label={rank !== -1 ? `#${rank}` : "∞"}
      />
      <Item Icon={SparklesIcon} active={active} label={`${earnings}`} />
    </Tab>
  );
}

export function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      className={cn(
        "flex justify-between items-center grow border border-secondary rounded-md px-4 py-2 cursor-pointer",
        active ? "opacity-100 bg-secondary" : "opacity-50 bg-background",
        hovered && (active ? "opacity-90" : "bg-secondary/50"),
      )}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

export function Item({
  Icon,
  active,
  label,
}: {
  Icon: React.ComponentType<StateIconProps>;
  active: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size="sm" variant={active ? "solid" : "line"} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
