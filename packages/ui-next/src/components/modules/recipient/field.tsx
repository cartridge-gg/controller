import { cn } from "@/utils";
import { Textarea } from "@/components/primitives";
import { useMemo } from "react";

type FieldProps = {
  value?: string | number;
  isError?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  className?: string;
};

export function Field({
  value,
  isError,
  onChange,
  onFocus,
  onBlur,
  className,
}: FieldProps) {
  const height = useMemo(() => {
    const count = value?.toString().length || 1;
    return Math.floor((count - 1) / 33) * 20 + 48;
  }, [value]);

  return (
    <Textarea
      spellCheck={false}
      className={cn(
        "resize-none min-h-12 min-w-[384px] bg-background-100 py-3 pl-4 pr-12 border border-background-200 text-base/5 font-mono font-normal overflow-hidden",
        "hover:border-background-300",
        "focus-visible:bg-background-200 focus-visible:border-background-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none",
        isError &&
          "border-destructive-foreground hover:border-destructive-foreground focus-visible:border-destructive-foreground",
        className,
      )}
      style={{ height }}
      placeholder={"Recipient Address or Username"}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}
