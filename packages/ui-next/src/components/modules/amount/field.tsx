import { cn, Input } from "@cartridge/ui-next";

export type FieldProps = {
  value?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export function Field({ value, onChange = () => {}, className }: FieldProps) {
  return (
    <Input
      type="number"
      className={cn(
        "bg-background-200 pr-12 border border-background-200 focus-visible:border-muted focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none",
        className,
      )}
      placeholder={(0).toLocaleString()}
      value={value ?? ""}
      onChange={onChange}
    />
  );
}
