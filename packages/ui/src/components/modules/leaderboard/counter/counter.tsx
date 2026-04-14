import { LeaderboardIcon } from "@/index";
import { cn } from "@/utils";

export interface LeaderboardCounterProps {
  rank: number;
  active?: boolean;
  className?: string;
}

export const LeaderboardCounter = ({
  rank,
  active,
  className,
}: LeaderboardCounterProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center px-2 py-1 text-sm rounded-full",
        active ? "bg-background-300" : "bg-background-200",
        className,
      )}
    >
      <LeaderboardIcon
        variant="solid"
        size="xs"
        className={active ? "text-foreground-100" : "text-foreground-300"}
      />
      <p
        className={cn(
          "text-xs tracking-wider text-foreground-300 font-semibold px-0.5",
          active && "text-foreground-100",
        )}
      >
        {rank}
      </p>
    </div>
  );
};

export default LeaderboardCounter;
