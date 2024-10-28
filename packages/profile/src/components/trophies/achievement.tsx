import { cn, TrackIcon, CalendarIcon, SparklesIcon } from "@cartridge/ui-next";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useCallback } from "react";

export function Achievement({
  icon,
  title,
  description,
  percentage,
  earning,
  timestamp,
  count,
  total,
  hidden,
  completed,
  pinned,
  id,
  softview,
  enabled,
  onPin,
}: {
  icon: string;
  title: string;
  description: string;
  percentage: string;
  earning: number;
  timestamp: number;
  count: number;
  total: number;
  hidden: boolean;
  completed: boolean;
  pinned: boolean;
  id: string;
  softview: boolean;
  enabled: boolean;
  onPin: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-x-px">
      <div className="grow flex flex-col items-stretch gap-y-2 bg-secondary p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <div
              className={cn(
                "w-6 h-6",
                completed ? "text-primary" : "text-quaternary-foreground",
                icon,
                "fa-solid",
              )}
            />
          </div>
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
        {!hidden && count < total && <Progress count={count} total={total} />}
      </div>
      {completed &&
        !softview &&
        !!softview && ( // TODO: Enable when we can have the pinned feature on server side, remove !!softview
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
        "text-sm text-accent-foreground capitalize",
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

function Details({ percentage }: { percentage: string }) {
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

function Progress({ count, total }: { count: number; total: number }) {
  return (
    <div className="bg-secondary py-2 flex gap-4">
      <div className="grow flex flex-col justify-center items-start bg-quaternary rounded-xl p-1">
        <div
          style={{ width: `${Math.floor((100 * count) / total)}%` }}
          className={cn("grow bg-accent-foreground rounded-xl")}
        />
      </div>
      <p className="text-xs text-quaternary-foreground">
        {`${count.toLocaleString()} of ${total.toLocaleString()}`}
      </p>
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
  const onClick = useCallback(() => {
    if (!enabled && !pinned) return;
    onPin(id);
    toast.success(`Trophy ${pinned ? "unpinned" : "pinned"} successfully`);
  }, [enabled, pinned, id, onPin]);

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
      onClick={onClick}
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
