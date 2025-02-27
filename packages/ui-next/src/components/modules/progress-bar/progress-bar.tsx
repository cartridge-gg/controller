import { Progress } from "#components/primitives";
import { cn } from "#utils";
import { useMemo } from "react";

interface ProgressBarProps {
  count: number;
  total: number;
  completed: boolean;
}

export function ProgressBar({ count, total, completed }: ProgressBarProps) {
  const value = useMemo(() => {
    return Math.floor((100 * Math.min(count, total)) / total);
  }, [count, total]);

  return (
    <div className="grow flex items-center bg-background-300 rounded-full p-1">
      <Progress
        value={value}
        className={cn(
          "grow rounded-full",
          completed ? "bg-primary" : "bg-foreground-200",
        )}
      />
    </div>
  );
}
