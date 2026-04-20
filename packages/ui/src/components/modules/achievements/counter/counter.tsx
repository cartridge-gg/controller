import { cn } from "@/utils";

export interface AchievementCounterProps {
  count: number;
  total: number;
  active?: boolean;
  className?: string;
}

export const AchievementCounter = ({
  count,
  total,
  active,
  className,
}: AchievementCounterProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 px-2 py-1 text-sm rounded-full",
        active ? "bg-background-300" : "bg-background-200",
        className,
      )}
    >
      <p
        className={cn(
          "text-xs tracking-wider text-foreground-300 font-semibold",
          active && "text-foreground-100",
        )}
      >
        {`${count}/${total}`}
      </p>
    </div>
  );
};

export default AchievementCounter;
