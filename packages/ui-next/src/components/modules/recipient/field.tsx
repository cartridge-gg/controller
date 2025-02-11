import { cn } from "@/utils";
import { Textarea } from "@/components/primitives";
import { useMemo } from "react";

type FieldProps = {
  value?: string | number;
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onClear?: () => void;
};

export function Field({
  value,
  isLoading,
  isError,
  onChange,
  onFocus,
  onBlur,
  onClear,
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
        "resize-none min-h-12 min-w-[384px] bg-background-200 py-3 pl-4 pr-12 border border-background-300 text-base/5 font-mono font-normal overflow-hidden",
        "hover:border-background-400",
        "focus-visible:bg-background-300 focus-visible:border-background-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none",
        isError &&
          "border-destructive-100 hover:border-destructive-100 focus-visible:border-destructive-100",
        className,
      )}
      style={{ height }}
      placeholder={"Recipient Address or Username"}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      isLoading={isLoading}
      onClear={onClear}
    />
  );
}
