import { CheckboxCheckedIcon, CheckboxUncheckedIcon, cn } from "@/index";
import { useMemo } from "react";

interface TaskHeaderAchievementProps {
  count: number;
  total: number;
  description: string;
}

export function TaskHeaderAchievement({
  count,
  total,
  description,
}: TaskHeaderAchievementProps) {
  const Icon = useMemo(() => {
    if (count >= total) {
      return CheckboxCheckedIcon;
    }
    return CheckboxUncheckedIcon;
  }, [count, total]);

  return (
    <div className="flex items-center gap-x-2">
      <Icon className="min-w-4 text-foreground-300" size="xs" />
      <p
        className={cn(
          "text-xs text-foreground-300",
          count >= total && "line-through opacity-50",
        )}
      >
        {description}
      </p>
    </div>
  );
}

export default TaskHeaderAchievement;
