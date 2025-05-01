import { cn } from "@/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md",
        "bg-[linear-gradient(to_right,var(--background-150)_0%,var(--background-200)_20%,var(--background-150)40%)]",
        "bg-[length:200%_100%]",
        "animate-shimmer",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
