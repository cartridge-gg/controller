import {
  cn,
  TrackIcon,
  CalendarIcon,
  SparklesIcon,
  CheckboxCheckedDuoIcon,
  CheckboxUncheckedIcon,
} from "@cartridge/ui-next";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useCallback } from "react";

export interface AchievementTask {
  id: string;
  count: number;
  total: number;
  description: string;
}

export function Achievement({
  icon,
  title,
  description,
  percentage,
  earning,
  timestamp,
  hidden,
  completed,
  pinned,
  id,
  softview,
  enabled,
  tasks,
  onPin,
}: {
  icon: string;
  title: string;
  description: string;
  percentage: string;
  earning: number;
  timestamp: number;
  hidden: boolean;
  completed: boolean;
  pinned: boolean;
  id: string;
  softview: boolean;
  enabled: boolean;
  tasks: AchievementTask[];
  onPin: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-x-px">
      <div className="grow flex flex-col items-stretch gap-y-3 bg-secondary p-3">
        <div className="flex items-center gap-3">
          <Icon icon={icon} completed={completed} />
          <div className="grow flex flex-col">
            <div className="flex justify-between items-center">
              <Title title={title} completed={completed} />
              {completed ? (
                <Timestamp timestamp={timestamp} />
              ) : (
                <Earning amount={earning.toLocaleString()} />
              )}
            </div>
            <Details percentage={percentage} />
          </div>
        </div>
        <Description description={description} />
        <div className="flex flex-col gap-y-2">
          {(!hidden || completed) &&
            tasks.map((task) => (
              <Task key={task.id} task={task} completed={completed} />
            ))}
        </div>
      </div>
      {completed &&
        !softview &&
        !!softview && ( // TODO: Enable when we can have the pinned feature on server side, remove !!softview
          <Track enabled={enabled} pinned={pinned} id={id} onPin={onPin} />
        )}
    </div>
  );
}

function Task({
  task,
  completed,
}: {
  task: AchievementTask;
  completed: boolean;
}) {
  const TaskIcon = useMemo(() => {
    if (completed) {
      return CheckboxCheckedDuoIcon;
    }
    return CheckboxUncheckedIcon;
  }, [completed]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-x-2">
        <TaskIcon
          className="text-quaternary-foreground"
          size="xs"
          variant={"default"}
        />
        <p
          className={cn(
            "text-xs text-quaternary-foreground",
            completed && "line-through",
          )}
        >
          {task.description}
        </p>
      </div>
      <Progress count={task.count} total={task.total} completed={completed} />
    </div>
  );
}

function Icon({ icon, completed }: { icon: string; completed: boolean }) {
  return (
    <div
      className={cn(
        "w-8 h-8 flex items-center justify-center",
        completed ? "text-primary" : "text-quaternary-foreground",
      )}
    >
      <div className={cn("w-6 h-6", icon, "fa-solid")} />
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
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
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

function Progress({
  count,
  total,
  completed,
}: {
  count: number;
  total: number;
  completed: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="grow flex flex-col justify-center items-start bg-quaternary rounded-xl p-1">
        <div
          style={{
            width: `${Math.floor((100 * Math.min(count, total)) / total)}%`,
          }}
          className={cn(
            "grow bg-accent-foreground rounded-xl",
            completed ? "bg-primary" : "text-quaternary-foreground",
          )}
        />
      </div>
      {completed && total > 1 ? (
        <div className="flex items-center gap-1">
          <div className="fa-solid fa-check text-xs text-quaternary-foreground" />
          <p className="text-xs text-quaternary-foreground">
            {`${count.toLocaleString()}`}
          </p>
        </div>
      ) : total > 1 ? (
        <div className="flex items-center gap-1">
          <div className="text-xs text-quaternary-foreground" />
          <p className="text-xs text-quaternary-foreground">
            {`${count.toLocaleString()} of ${total.toLocaleString()}`}
          </p>
        </div>
      ) : completed ? (
        <div className="flex items-center gap-1">
          <div className="fa-solid fa-check text-xs text-quaternary-foreground" />
          <p className="text-xs text-quaternary-foreground">Completed</p>
        </div>
      ) : (
        <p className="text-xs text-quaternary-foreground">
          {`${count.toLocaleString()} / ${total.toLocaleString()}`}
        </p>
      )}
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
