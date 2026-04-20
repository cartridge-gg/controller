import { ProgressBar, SparklesIcon, TrophyIcon } from "@/index";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";

export interface AchievementProgressProps
  extends VariantProps<typeof achievementProgressVariants> {
  count: number;
  total: number;
  points: number;
  completed?: boolean;
  className?: string;
  color?: string;
}

const achievementProgressVariants = cva("p-3 flex items-center gap-x-3", {
  variants: {
    variant: {
      darkest: "bg-background-100",
      darker: "bg-background-100",
      dark: "bg-background-100",
      default: "bg-background-200",
      light: "bg-background-200",
      lighter: "bg-background-200",
      lightest: "bg-background-200",
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
  className,
  color,
}: AchievementProgressProps) {
  return (
    <div className={cn(achievementProgressVariants({ variant }), className)}>
      <div className="flex gap-x-1">
        <TrophyIcon variant="solid" size="xs" className="text-foreground-300" />
        <p className="text-foreground-300 text-xs font-medium">
          {count.toLocaleString()} of {total.toLocaleString()}
        </p>
      </div>
      <ProgressBar
        count={count}
        total={total}
        completed={!!completed}
        className={className}
        color={color}
      />
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
