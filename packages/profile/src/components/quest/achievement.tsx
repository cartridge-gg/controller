import {
  cn,
  TrackIcon,
  CalendarIcon,
  SparklesIcon,
  StateIconProps,
  TrophyIcon,
} from "@cartridge/ui-next";
import { useMemo, useState } from "react";

export function Achievement({
  Icon,
  title,
  description,
  percentage,
  earning,
  timestamp,
  completed,
  pinned,
  id,
  enabled,
  onPin,
}: {
  Icon: React.ComponentType<StateIconProps> | undefined;
  title: string;
  description: string;
  percentage: number;
  earning: number;
  timestamp: number;
  completed: boolean;
  pinned: boolean;
  id: string;
  enabled: boolean;
  onPin: (id: string) => void;
}) {
  const AchievementIcon = useMemo(() => {
    if (!!Icon) return Icon;
    return TrophyIcon;
  }, [Icon, completed]);

  return (
    <div className="flex items-center gap-x-px">
      <div className="grow flex-col items-stretch gap-2 bg-secondary p-2">
        <div className="flex items-center gap-2">
          <AchievementIcon
            className={cn(
              "min-w-8 min-h-8",
              completed ? "text-primary" : "text-muted-foreground",
            )}
            variant="solid"
          />
          <div className="grow flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Title title={title} completed={completed} />
                {completed && <Timestamp timestamp={timestamp} />}
              </div>
              <div className="flex gap-2">
                <Earning amount={earning.toLocaleString()} />
              </div>
            </div>
            <Details percentage={percentage} />
          </div>
        </div>
        <Description description={description} />
      </div>
      {completed && <Track enabled={enabled} pinned={pinned} id={id} onPin={onPin} />}
    </div>
  );
}

function Title({ title, completed }: { title: string; completed: boolean }) {
  return (
    <p
      className={cn(
        "text-xs text-muted-foreground capitalize",
        completed && "text-priamry-foreground",
      )}
    >
      {title}
    </p>
  );
}

function Description({ description }: { description: string }) {
  const [full, setFull] = useState(false);
  const visible = useMemo(() => description.length > 100, [description]);
  const content = useMemo(() => {
    if (!visible || full) {
      return description.slice(0, 1).toUpperCase() + description.slice(1);
    }
    return (
      description.slice(0, 1).toUpperCase() + description.slice(1, 100) + "..."
    );
  }, [description, full]);

  if (description.length === 0) return null;
  return (
    <p className="text-xs text-muted-foreground">
      {content}
      {visible && (
        <span
          className={cn("text-muted-foreground", full && "block")}
          onClick={() => setFull(!full)}
        >
          {full ? " read less" : " read more"}
        </span>
      )}
    </p>
  );
}

function Details({ percentage }: { percentage: number }) {
  return (
    <p className="text-[0.65rem] text-muted-foreground tracking-wider">{`${percentage}% of players earned`}</p>
  );
}

function Earning({ amount }: { amount: string }) {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <SparklesIcon size="xs" variant="solid" />
      <p className="text-xs">{amount}</p>
    </div>
  );
}

function Timestamp({ timestamp }: { timestamp: number }) {
  const date = useMemo(() => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    if (date.getDate() === today.getDate()) {
      return "Today";
    } else if (date.getDate() === today.getDate() - 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      });
    }
  }, [timestamp]);

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <CalendarIcon size="xs" variant="line" />
      <p className="text-[0.65rem]">{date}</p>
    </div>
  );
}

function Track({
  pinned,
  id,
  enabled,
  onPin,
}: {
  pinned: boolean;
  id: string;
  enabled: boolean;
  onPin: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "bg-secondary h-full p-2 flex items-center transition-all duration-200",
        hovered && (enabled || pinned) && "opacity-90 bg-secondary/50 cursor-pointer",
        !enabled && !pinned && "cursor-not-allowed",
      )}
      onClick={() => (enabled || pinned) &&onPin(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <TrackIcon className={cn(!enabled && !pinned && "opacity-25")} size="sm" variant={pinned ? "solid" : "line"} />
    </div>
  );
}
