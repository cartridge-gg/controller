import { CheckboxCheckedIcon, CheckboxUncheckedIcon } from "@/index";
import { cn } from "@/utils";
import { useMemo } from "react";

interface AchievementTaskHeaderProps {
  count: number;
  total: number;
  description: string;
}

export function AchievementTaskHeader({
  count,
  total,
  description,
}: AchievementTaskHeaderProps) {
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

export default AchievementTaskHeader;
