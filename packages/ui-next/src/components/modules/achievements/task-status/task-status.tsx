import { CheckIcon } from "@/index";

interface AchievementTaskStatusProps {
  count: number;
  total: number;
}

export function AchievementTaskStatus({
  count,
  total,
}: AchievementTaskStatusProps) {
  return count >= total ? (
    <div className="flex items-center gap-x-1">
      <CheckIcon size="xs" className="text-foreground-300" />
      <p className="text-xs text-foreground-300">
        {total > 1 ? `${count.toLocaleString()}` : "Completed"}
      </p>
    </div>
  ) : (
    <p className="text-xs text-foreground-300">
      {`${count.toLocaleString()} of ${total.toLocaleString()}`}
    </p>
  );
}

export default AchievementTaskStatus;
