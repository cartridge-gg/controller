import { cn } from "@cartridge/ui-next";

export type ConversionProps = {
  value?: string;
  className?: string;
};

export function Conversion({ value, className }: ConversionProps) {
  return (
    <span className={cn("text-sm text-foreground-300", className)}>
      {value}
    </span>
  );
}
