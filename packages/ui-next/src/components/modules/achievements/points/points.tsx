import { CalendarIcon, SparklesIcon } from "#components/icons";
import { Separator } from "#components/primitives";
import { useMemo } from "react";
import { cn } from "#utils";

interface AchievementPointsProps {
  points: number;
  timestamp?: number;
}

export function AchievementPoints({
  points,
  timestamp,
}: AchievementPointsProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center gap-1",
          timestamp ? "text-foreground-400" : "text-foreground-300",
        )}
      >
        <SparklesIcon size="xs" variant={timestamp ? "line" : "solid"} />
        <p className={cn("text-xs", timestamp && "line-through")}>
          {points.toLocaleString()}
        </p>
      </div>
      {timestamp && (
        <Separator
          className="bg-background-400 h-2 ml-0.5"
          orientation="vertical"
        />
      )}
      {timestamp && <Timestamp timestamp={timestamp} />}
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
    <div className="flex items-center gap-1 text-foreground-400">
      <CalendarIcon size="xs" variant="line" />
      <p className="text-xs">{date}</p>
    </div>
  );
}
