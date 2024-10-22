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
      <div className="grow flex flex-col items-stretch gap-y-2 bg-secondary p-3">
        <div className="flex items-center gap-2">
          <AchievementIcon
            className={cn(
              "min-w-8 min-h-8",
              completed ? "text-primary" : "text-quaternary-foreground",
            )}
            variant="solid"
          />
          <div className="grow flex flex-col gap-[2px]">
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
      {completed && (
        <Track enabled={enabled} pinned={pinned} id={id} onPin={onPin} />
      )}
    </div>
  );
}

function Title({ title, completed }: { title: string; completed: boolean }) {
  const overflow = useMemo(() => title.length > 27, [title]);
  const content = useMemo(() => {
    if (!overflow) return title;
    return title.slice(0, 24) + "...";
  }, [title, overflow]);
  return (
    <p
      className={cn(
        "text-xs text-accent-foreground capitalize",
        completed && "text-foreground",
      )}
    >
      {content}
    </p>
  );
}

function Description({ description }: { description: string }) {
  const [full, setFull] = useState(false);
  const [bright, setBright] = useState(false);
  const visible = useMemo(() => description.length > 100, [description]);
  const content = useMemo(() => {
    if (!visible || full) {
      return description.slice(0, 1).toUpperCase() + description.slice(1);
    }
    return (
      description.slice(0, 1).toUpperCase() + description.slice(1, 100) + "..."
    );
  }, [description, visible, full]);

  if (description.length === 0) return null;
  return (
    <p className="block text-xs text-accent-foreground">
      {content}
      {visible && (
        <span
          className={cn(
            "text-quaternary-foreground cursor-pointer",
            full && "block",
            bright ? "brightness-150" : "brightness-100",
          )}
          onClick={() => setFull(!full)}
          onMouseEnter={() => setBright(true)}
          onMouseLeave={() => setBright(false)}
        >
          {full ? " read less" : " read more"}
        </span>
      )}
    </p>
  );
}

function Details({ percentage }: { percentage: number }) {
  return (
    <p className="text-[0.65rem] text-quaternary-foreground">{`${percentage}% of players earned`}</p>
  );
}

function Earning({ amount }: { amount: string }) {
  return (
    <div className="flex items-center gap-1 text-quaternary-foreground">
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
    <div className="flex items-center gap-1 text-quaternary-foreground">
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
        "bg-quaternary h-full p-2 flex items-center transition-all duration-200",
        pinned ? "bg-quaternary" : "bg-secondary",
        hovered &&
          (enabled || pinned) &&
          "opacity-90 bg-secondary/50 cursor-pointer",
        !enabled && !pinned && "cursor-not-allowed",
      )}
      onClick={() => (enabled || pinned) && onPin(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <TrackIcon
        className={cn(!enabled && !pinned && "opacity-25")}
        size="sm"
        variant={pinned ? "solid" : "line"}
      />
    </div>
  );
}
