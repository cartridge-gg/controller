import {
  ProgressBar,
  AchievementTaskHeader,
  AchievementTaskStatus,
} from "@/index";

interface TaskAchievementProps {
  count: number;
  total: number;
  description: string;
}

export function TaskAchievement({
  count,
  total,
  description,
}: TaskAchievementProps) {
  return (
    <div className="flex flex-col gap-2">
      <AchievementTaskHeader
        count={count}
        total={total}
        description={description}
      />
      <div className="flex gap-3">
        <ProgressBar count={count} total={total} completed={count >= total} />
        <AchievementTaskStatus count={count} total={total} />
      </div>
    </div>
  );
}

export default TaskAchievement;
