import {
  ProgressBar,
  TaskHeaderAchievement,
  TaskStatusAchievement,
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
      <TaskHeaderAchievement
        count={count}
        total={total}
        description={description}
      />
      <div className="flex gap-3">
        <ProgressBar count={count} total={total} completed={count >= total} />
        <TaskStatusAchievement count={count} total={total} />
      </div>
    </div>
  );
}

export default TaskAchievement;
