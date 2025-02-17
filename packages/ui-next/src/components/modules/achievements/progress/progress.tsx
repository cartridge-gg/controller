import { cn, ProgressBar, SparklesIcon, TrophyIcon } from "@/index";
import { cva, VariantProps } from "class-variance-authority";

export interface AchievementProgressProps
  extends VariantProps<typeof achievementProgressVariants> {
  count: number;
  total: number;
  points: number;
  completed?: boolean;
}

const achievementProgressVariants = cva("p-3 flex items-center gap-x-3", {
  variants: {
    variant: {
      default: "bg-background-200",
      faded: "bg-background-100",
      ghost: "bg-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function AchievementProgress({
  count,
  total,
  points,
  completed,
  variant,
}: AchievementProgressProps) {
  return (
    <div className={cn(achievementProgressVariants({ variant }))}>
      <div className="flex gap-x-1">
        <TrophyIcon variant="solid" size="xs" className="text-foreground-300" />
        <p className="text-foreground-300 text-xs font-medium">
          {count.toLocaleString()} of {total.toLocaleString()}
        </p>
      </div>
      <ProgressBar count={count} total={total} completed={!!completed} />
      <div className="flex gap-x-1">
        <SparklesIcon
          variant="solid"
          size="xs"
          className="text-foreground-300"
        />
        <p className="text-foreground-300 text-xs font-medium">
          {points.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default AchievementProgress;
