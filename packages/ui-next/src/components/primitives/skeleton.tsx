import { cn } from "#utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-background-200-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
