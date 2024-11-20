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
    <Tab priority={true} active={active} onClick={onClick}>
      <Item Icon={TrophyIcon} active={active} label={"Achievements"} />
      <p className="bg-quinary text-xs rounded-2xl px-1.5 py-0.5 font-bold">
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
    <Tab priority={false} active={active} onClick={onClick}>
      <Item
        Icon={LeaderboardIcon}
        active={active}
        label={!rank ? "---" : `#${rank}`}
      />
      <Item Icon={SparklesIcon} active={active} label={`${earnings}`} />
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
      <div className="flex items-center border border-secondary rounded-md py-2 px-3">
        <Item
          Icon={LeaderboardIcon}
          active={true}
          label={!rank ? "---" : `#${rank}`}
        />
      </div>
      <div className="flex items-center border border-secondary rounded-md py-2 px-3">
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
        "h-10 grow w-1/2 flex justify-between items-center gap-2 border border-secondary rounded-md p-3 cursor-pointer",
        priority && "min-w-1/2",
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
    <div className="flex items-center gap-1">
      <Icon size="sm" variant={active ? "solid" : "line"} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
