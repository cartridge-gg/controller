import {
  cn,
  LeaderboardIcon,
  SparklesIcon,
  StateIconProps,
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
    <Tab priority={true} active={active} onClick={onClick}>
      <Item active={active} label={"Achievements"} />
      <Item active={active} label={`${completed}/${total}`} highlighted />
    </Tab>
  );
}

export function LeaderboardTab({
  active,
  rank,
  onClick,
}: {
  active: boolean;
  rank: number;
  onClick: () => void;
}) {
  return (
    <Tab priority={false} active={active} onClick={onClick}>
      <Item active={active} label="Rank" />
      <Item
        Icon={LeaderboardIcon}
        active={active}
        label={rank ? `${rank}` : "-"}
        highlighted
      />
    </Tab>
  );
}

export function Scoreboard({
  rank,
  earnings,
}: {
  rank: number;
  earnings: number;
}) {
  return (
    <div className="flex gap-3 select-none">
      <div className="flex items-center border border-background-100 rounded-md py-2 px-3">
        <Item
          Icon={LeaderboardIcon}
          active={true}
          label={!rank ? "---" : `#${rank}`}
        />
      </div>
      <div className="flex items-center border border-background-100 rounded-md py-2 px-3">
        <Item Icon={SparklesIcon} active={true} label={`${earnings}`} />
      </div>
    </div>
  );
}

export function Tab({
  active,
  priority,
  onClick,
  children,
}: {
  active: boolean;
  priority: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      className={cn(
        "h-10 grow w-1/2 flex justify-between items-center gap-2 border border-background-100 rounded-md p-3 cursor-pointer",
        priority && "min-w-1/2",
        active ? "opacity-100 bg-background-100" : "opacity-50 bg-background",
        hovered && (active ? "opacity-90" : "bg-background-100/50"),
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
  highlighted,
}: {
  Icon?: React.ComponentType<StateIconProps>;
  active: boolean;
  label: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        highlighted &&
          `${active ? "bg-background-200" : "bg-background-100"} min-w-5 h-6 text-xs rounded-2xl px-2 py-1 font-semibold`,
      )}
    >
      {Icon && <Icon size="sm" variant={active ? "solid" : "line"} />}
      <p className={highlighted ? "text-xs" : "text-sm"}>{label}</p>
    </div>
  );
}
