import { CalendarIcon, Separator, SparklesIcon } from "@/index";
import { cn } from "@/utils";
import { getDate } from "@cartridge/ui/utils";

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
  return (
    <div className="flex items-center gap-1 text-foreground-400">
      <CalendarIcon size="xs" variant="line" />
      <p className="text-xs">{getDate(timestamp * 1000)}</p>
    </div>
  );
}

export default AchievementPoints;
