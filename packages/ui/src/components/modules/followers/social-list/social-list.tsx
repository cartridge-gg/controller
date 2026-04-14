import { cn } from "@/utils";

export const FollowerSocialList = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-y-px rounded h-full overflow-y-scroll",
        className,
      )}
      style={{
        scrollbarWidth: "none",
      }}
      {...props}
    />
  );
};

export default FollowerSocialList;
