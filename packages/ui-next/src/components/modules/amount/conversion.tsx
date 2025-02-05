import { cn } from "@cartridge/ui-next";

export type ConversionProps = {
  value?: string;
  className?: string;
};

export function Conversion({ value, className }: ConversionProps) {
  return (
    <span
      className={cn(
        "absolute right-14 top-3.5 text-sm text-muted-foreground",
        className,
      )}
    >
      {value}
    </span>
  );
}
