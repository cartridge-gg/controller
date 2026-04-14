import { cn } from "@/utils";
import { AchievementIcon } from "../icon";
import { AchievementPoints } from "../points";

interface AchievementLabelProps {
  title: string;
  points: number;
  difficulty: number;
  icon?: string;
  timestamp?: number;
  completed?: boolean;
}

export function AchievementLabel({
  title,
  points,
  difficulty,
  icon,
  timestamp,
  completed,
}: AchievementLabelProps) {
  return (
    <div className="flex items-stretch gap-x-3">
      <AchievementIcon icon={icon} completed={completed} />
      <div className="grow flex flex-col items-stretch">
        <div className="flex justify-between">
          <AchievementTitle title={title} completed={completed} />
          <AchievementPoints points={points} timestamp={timestamp} />
        </div>
        <p className="text-foreground-300 text-[10px]/[12px]">{`${difficulty}% of players earned`}</p>
      </div>
    </div>
  );
}

export function AchievementTitle({
  title,
  completed,
}: {
  title: string;
  completed?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-sm font-medium",
        completed ? "text-foreground-100" : "text-foreground-300",
      )}
    >
      {title}
    </p>
  );
}

export default AchievementLabel;
