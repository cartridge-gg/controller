import {
  cn,
  TrackIcon,
  CalendarIcon,
  SparklesIcon,
  CheckboxCheckedIcon,
  CheckboxUncheckedIcon,
  Separator,
  SpinnerIcon,
  XIcon,
} from "@cartridge/ui-next";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useCallback } from "react";
import { useArcade } from "@/hooks/arcade";
import { useConnection } from "@/hooks/context";
import { useAccount } from "@/hooks/account";
import { addAddressPadding } from "starknet";
import { GameModel } from "@bal7hazar/arcade-sdk";
import { compare } from "compare-versions";

export interface Task {
  id: string;
  count: number;
  total: number;
  description: string;
}

export function Trophy({
  icon,
  title,
  description,
  percentage,
  earning,
  timestamp,
  hidden,
  completed,
  id,
  softview,
  enabled,
  tasks,
  game,
  pins,
}: {
  icon: string;
  title: string;
  description: string;
  percentage: string;
  earning: number;
  timestamp: number;
  hidden: boolean;
  completed: boolean;
  id: string;
  softview: boolean;
  enabled: boolean;
  tasks: Task[];
  game: GameModel | undefined;
  pins: { [playerId: string]: string[] };
}) {
  const { version } = useConnection();

  const compatibility = useMemo(() => {
    if (!version) return false;
    return compare(version, "0.5.9", ">=");
  }, [version]);

  return (
    <div
      className={cn(
        "flex items-stretch",
        completed && !softview && (compatibility || !!game) && "gap-x-px",
      )}
    >
      <div className="grow flex flex-col items-stretch gap-y-3 bg-background-200 p-3">
        <div className="flex items-center gap-3">
          <Icon icon={icon} completed={completed} />
          <div className="grow flex flex-col">
            <div className="flex justify-between items-center">
              <Title title={title} completed={completed} />
              <div className="flex items-center gap-2">
                <Earning
                  amount={earning.toLocaleString()}
                  completed={completed}
                />
                {completed && (
                  <Separator
                    className="bg-accent h-2 ml-0.5"
                    orientation="vertical"
                  />
                )}
                {completed && <Timestamp timestamp={timestamp} />}
              </div>
            </div>
            <Details percentage={percentage} />
          </div>
        </div>
        <Description description={description} />
        {(!hidden || completed) && (
          <div className="flex flex-col gap-y-2">
            {tasks.map((task) => (
              <Task key={task.id} task={task} completed={completed} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-px">
        {compatibility && completed && !softview && (
          <Track enabled={enabled} id={id} pins={pins} />
        )}
        {completed && !softview && !!game && (
          <Share
            title={title}
            game={game}
            earning={earning}
            timestamp={timestamp}
            percentage={percentage}
          />
        )}
      </div>
    </div>
  );
}

function Task({ task, completed }: { task: Task; completed: boolean }) {
  const TaskIcon = useMemo(() => {
    if (task.count >= task.total) {
      return CheckboxCheckedIcon;
    }
    return CheckboxUncheckedIcon;
  }, [task.count, task.total]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-x-2">
        <TaskIcon className="text-foreground-400" size="xs" />
        <p
          className={cn(
            "text-xs text-foreground-400",
            task.count >= task.total && "line-through opacity-50",
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
        completed ? "text-primary" : "text-foreground-400",
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
        "text-sm text-accent-foreground capitalize font-medium",
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
            "text-foreground-400 cursor-pointer",
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
    <p className="text-[0.65rem] text-foreground-400">{`${percentage}% of players earned`}</p>
  );
}

function Earning({
  amount,
  completed,
}: {
  amount: string;
  completed: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-foreground-400",
        completed && "opacity-50",
      )}
    >
      <SparklesIcon size="xs" variant={completed ? "line" : "solid"} />
      <p className={cn("text-sm", completed && "line-through")}>{amount}</p>
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
    <div className="flex items-center gap-1 text-foreground-400 opacity-50">
      <CalendarIcon size="xs" variant="line" />
      <p className="text-xs">{date}</p>
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
      <div className="grow flex flex-col justify-center items-start bg-background-300 rounded-xl p-1">
        <div
          style={{
            width: `${Math.floor((100 * Math.min(count, total)) / total)}%`,
          }}
          className={cn(
            "grow bg-accent-foreground rounded-xl",
            completed ? "bg-primary" : "text-foreground-400",
          )}
        />
      </div>
      {count >= total ? (
        <div className="flex items-center gap-x-2">
          <div className="fa-solid fa-check text-xs text-foreground-400" />
          <p className="text-xs text-foreground-400 font-medium">
            {total > 1 ? `${count.toLocaleString()}` : "Completed"}
          </p>
        </div>
      ) : (
        <p className="text-xs text-foreground-400 font-medium">
          {`${count.toLocaleString()} of ${total.toLocaleString()}`}
        </p>
      )}
    </div>
  );
}

function Track({
  id,
  enabled,
  pins,
}: {
  id: string;
  enabled: boolean;
  pins: { [playerId: string]: string[] };
}) {
  const { address } = useAccount();
  const { parent } = useConnection();
  const { chainId, provider } = useArcade();

  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const pinned = useMemo(() => {
    return pins[addAddressPadding(address)]?.includes(id);
  }, [pins, address, id]);

  const handlePin = useCallback(() => {
    if (!enabled || pinned) return;
    const pin = async () => {
      setLoading(true);
      try {
        const calls = provider.social.pin({ achievementId: id });
        const res = await parent.openExecute(
          Array.isArray(calls) ? calls : [calls],
          chainId,
        );
        if (res) {
          toast.success(`Trophy pinned successfully`);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to pin trophy");
      } finally {
        setLoading(false);
      }
    };
    pin();
  }, [enabled, pinned, id, chainId, provider, parent]);

  const handleUnpin = useCallback(() => {
    if (!pinned) return;
    const unpin = async () => {
      setLoading(true);
      try {
        const calls = provider.social.unpin({ achievementId: id });
        const res = await parent.openExecute(
          Array.isArray(calls) ? calls : [calls],
          chainId,
        );
        if (res) {
          toast.success(`Trophy unpinned successfully`);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to unpin trophy");
      } finally {
        setLoading(false);
      }
    };
    unpin();
  }, [pinned, id, chainId, provider, parent]);

  return (
    <div
      className={cn(
        "bg-background-200 grow p-2 flex items-center transition-all duration-200",
        hovered &&
          (enabled || pinned) &&
          "opacity-90 bg-background-200/50 cursor-pointer",
        pinned && "bg-background-300",
      )}
      onClick={pinned ? handleUnpin : handlePin}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading ? (
        <SpinnerIcon className="text-foreground-400 animate-spin" size="sm" />
      ) : (
        <TrackIcon
          className={cn(!enabled && !pinned && "opacity-25")}
          size="sm"
          variant={pinned ? "solid" : "line"}
        />
      )}
    </div>
  );
}

function Share({
  game,
  title,
  earning,
  timestamp,
  percentage,
}: {
  game: GameModel;
  title: string;
  earning: number;
  timestamp: number;
  percentage: string;
}) {
  const url: string | null = useMemo(() => {
    if (!game.socials.website) return null;
    return game.socials.website;
  }, [game]);

  const xhandle = useMemo(() => {
    if (!game.socials.twitter) return null;
    // Take the last part of the url
    return game.socials.twitter.split("/").pop();
  }, [game]);

  const date = useMemo(() => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [timestamp]);

  const handleShare = useCallback(() => {
    if (!url || !xhandle) return;
    const content = `🚨 THIS ISN’T JUST AN ACHIEVEMENT. IT’S HISTORY.

🏆 ${title} Unlocked in @${xhandle}

✨ +${earning} Points | 📅 ${date}

Only ${percentage}% of players have earned this rare badge.

Do you have what it takes to carve your name into history?

💥 Prove it. Play now 👇`;

    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(
      content,
    )}&url=${encodeURIComponent(url)}`;

    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  }, [url, xhandle, title, earning, date, percentage]);

  if (!url || !xhandle) return null;

  return (
    <div
      className={cn(
        "grow bg-background-200 p-2 flex items-center transition-all duration-200 hover:opacity-90 hover:cursor-pointer",
      )}
      onClick={handleShare}
    >
      <XIcon size="sm" />
    </div>
  );
}
