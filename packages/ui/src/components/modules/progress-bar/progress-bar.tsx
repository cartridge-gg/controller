import { Progress } from "@/index";
import { cn } from "@/utils";
import { useMemo } from "react";

interface ProgressBarProps {
  count: number;
  total: number;
  completed: boolean;
  className?: string;
  color?: string;
}

export function ProgressBar({
  count,
  total,
  completed,
  className,
  color,
}: ProgressBarProps) {
  const value = useMemo(() => {
    return Math.floor((100 * Math.min(count, total)) / total);
  }, [count, total]);

  return (
    <div className="grow flex items-center bg-background-300 rounded-full p-1 ">
      <Progress
        value={value}
        color={color}
        completed={completed}
        className={cn(
          "grow rounded-full bg-foreground-200 data-[completed=true]:bg-primary",
          className,
        )}
      />
    </div>
  );
}
