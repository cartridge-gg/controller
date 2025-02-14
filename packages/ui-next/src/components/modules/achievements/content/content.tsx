import { AchievementLabel, AchievementTask, CardContent } from "@/index";
import { useMemo } from "react";

export interface AchievementContentProps {
  icon?: string;
  title?: string;
  description?: string;
  points: number;
  difficulty: number;
  tasks?: {
    count: number;
    total: number;
    description: string;
  }[];
  timestamp?: number;
  hidden?: boolean;
}

export function AchievementContent({
  icon,
  title,
  description,
  points,
  difficulty,
  tasks,
  timestamp,
  hidden,
}: AchievementContentProps) {
  const completed = useMemo(() => {
    return tasks && tasks.every((task) => task.count >= task.total);
  }, [tasks]);

  const show = useMemo(() => {
    return completed || !hidden;
  }, [hidden, completed]);

  return (
    <CardContent className="grow w-full flex flex-col gap-y-3">
      <AchievementLabel
        icon={icon}
        title={show ? (title ?? "") : "Hidden Achievement"}
        points={points}
        difficulty={difficulty}
        timestamp={timestamp}
        completed={completed}
      />
      {show && <p className="text-foreground-300 text-xs">{description}</p>}
      {show &&
        tasks &&
        tasks.map((task) => (
          <AchievementTask
            key={task.description}
            completed={completed}
            {...task}
          />
        ))}
    </CardContent>
  );
}

export default AchievementContent;
