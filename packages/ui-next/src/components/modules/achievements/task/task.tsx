import {
  ProgressBar,
  AchievementTaskHeader,
  AchievementTaskStatus,
} from "@/index";

export interface AchievementTaskProps {
  count: number;
  total: number;
  description: string;
  completed?: boolean;
}

export function AchievementTask({
  count,
  total,
  description,
  completed,
}: AchievementTaskProps) {
  return (
    <div className="flex flex-col gap-2">
      <AchievementTaskHeader
        count={count}
        total={total}
        description={description}
      />
      <div className="flex gap-3">
        <ProgressBar count={count} total={total} completed={!!completed} />
        <AchievementTaskStatus count={count} total={total} />
      </div>
    </div>
  );
}

export default AchievementTask;
