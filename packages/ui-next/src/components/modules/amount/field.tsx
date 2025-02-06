import { cn, Input } from "@cartridge/ui-next";

type FieldProps = {
  value?: number;
  isError?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export function Field({
  value,
  isError,
  onChange = () => {},
  className,
}: FieldProps) {
  return (
    <Input
      type="number"
      className={cn(
        "h-12 bg-background-100 pr-28 border border-background-200",
        "hover:border-background-300",
        "focus-visible:bg-background-200 focus-visible:border-background-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none",
        isError &&
          "border-destructive-foreground hover:border-destructive-foreground focus-visible:border-destructive-foreground",
        className,
      )}
      placeholder={(0).toLocaleString()}
      value={value ?? ""}
      onChange={onChange}
    />
  );
}
