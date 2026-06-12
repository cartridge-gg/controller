import { CaratIcon, SelectTrigger, SelectValue } from "@/index";
import { cn } from "@/utils";

export const TokenSelectHeader = ({
  className,
  singleToken,
  ...props
}: React.ComponentProps<typeof SelectTrigger> & { singleToken?: boolean }) => {
  return (
    <SelectTrigger
      className={cn(
        "w-fit border-0 flex gap-2 items-center p-2",
        singleToken && "pointer-events-none cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <SelectValue placeholder="Select Token" />
      {singleToken ? (
        <div className="w-1" />
      ) : (
        <CaratIcon variant="down" size="sm" className="text-foreground-300" />
      )}
    </SelectTrigger>
  );
};
