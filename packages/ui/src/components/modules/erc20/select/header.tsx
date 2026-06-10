import { CaratIcon, SelectTrigger, SelectValue } from "@/index";
import { cn } from "@/utils";

export const TokenSelectHeader = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) => {
  return (
    <SelectTrigger
      className={cn("w-fit border-0 flex gap-2 items-center p-2", className)}
      {...props}
    >
      <SelectValue placeholder="Select Token" />
      <CaratIcon variant="down" size="sm" className="text-foreground-300" />
    </SelectTrigger>
  );
};
