import { cn } from "@/utils";
import { IconProps, SpinnerIcon } from "./icons";

export function Spinner({ className, ...props }: IconProps) {
  return (
    <SpinnerIcon
      className={cn("animate-spin text-muted-foreground", className)}
      {...props}
    />
  );
}
