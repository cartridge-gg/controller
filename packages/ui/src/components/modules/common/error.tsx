import { AlertIcon } from "@/index";
import { cn } from "@/utils";

type ErrorProps = {
  label?: string;
  className?: string;
};

export function Error({ label, className }: ErrorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-x-1 text-destructive-100 select-none",
        !label && "hidden",
        className,
      )}
    >
      <AlertIcon className="h-5 w-5" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
