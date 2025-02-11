import { cn } from "@/utils";
import { Textarea } from "@/components/primitives";
import { useCallback, useEffect, useRef } from "react";

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
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = "1px";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <Textarea
      ref={ref}
      spellCheck={false}
      className={cn(
        "resize-none min-w-[320px] w-full min-h-12 bg-background-200 py-3 px-4 border border-background-300 text-base/5 font-mono font-normal overflow-hidden",
        "hover:border-background-400",
        "focus-visible:bg-background-300 focus-visible:border-background-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none",
        isError &&
          "border-destructive-100 hover:border-destructive-100 focus-visible:border-destructive-100",
        !!value && "pr-12",
        className,
      )}
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
