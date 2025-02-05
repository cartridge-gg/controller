import { AlertIcon, cn } from "@cartridge/ui-next";

export type ErrorProps = {
  label?: string;
  className?: string;
};

export function Error({ label, className }: ErrorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-x-1 text-destructive-foreground",
        !label && "hidden",
        className,
      )}
    >
      <AlertIcon className="h-5 w-5" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
