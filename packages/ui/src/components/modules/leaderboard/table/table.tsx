import { cn } from "@/utils";

export const LeaderboardTable = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-y-px rounded overflow-y-scroll",
        className,
      )}
      style={{
        scrollbarWidth: "none",
      }}
      {...props}
    />
  );
};

export default LeaderboardTable;
