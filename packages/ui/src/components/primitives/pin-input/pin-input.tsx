import { forwardRef, useRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Input } from "@/components/primitives/input";
import { cn } from "@/utils";

export type PinInputType = "numeric" | "alphanumeric";
export type PinInputCase = "uppercase" | "lowercase";

export const pinInputVariants = cva(
  "w-[40px] h-[52px] p-2 text-center text-md bg-background-125 focus:border-primary-200",
  {
    variants: {
      variant: {
        default: "border-background-200",
        destructive: "border-destructive-100 hover:border-destructive-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface PinInputProps extends VariantProps<typeof pinInputVariants> {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  type?: PinInputType;
  /** Restrict letters to a single case. Only applies when `type` is
   * `alphanumeric`; input of the wrong case is coerced. */
  lettercase?: PinInputCase;
  onEnter?: () => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}

export const PinInput = forwardRef<HTMLInputElement, PinInputProps>(
  function PinInput(
    {
      value,
      onChange,
      length = 6,
      type = "numeric",
      lettercase,
      variant,
      onEnter,
      disabled,
      className,
      inputClassName,
    },
    ref,
  ) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const assignRef = (el: HTMLInputElement | null, i: number) => {
      inputRefs.current[i] = el;
      if (i === 0) {
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number,
    ) => {
      const sanitized = sanitize(e.target.value, type, lettercase);
      if (!sanitized && e.target.value) return;
      const char = sanitized.slice(-1);
      const next = value.split("");
      next[index] = char;
      onChange(next.join("").slice(0, length));
      if (char && index < length - 1) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>,
      index: number,
    ) => {
      if (e.key === "Backspace" && !value[index] && index > 0)
        inputRefs.current[index - 1]?.focus();
      if (e.key === "Enter" && value.length === length && onEnter) onEnter();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      const sanitized = sanitize(
        e.clipboardData.getData("text"),
        type,
        lettercase,
      ).slice(0, length);
      if (sanitized) {
        onChange(sanitized);
        inputRefs.current[Math.min(sanitized.length, length - 1)]?.focus();
      }
    };

    return (
      <div className={cn("flex gap-3 justify-center", className)}>
        {Array.from({ length }).map((_, i) => (
          <Input
            key={i}
            ref={(el: HTMLInputElement | null) => assignRef(el, i)}
            className={cn(pinInputVariants({ variant }), inputClassName)}
            value={value[i] || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e, i)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(e, i)
            }
            onPaste={handlePaste}
            disabled={disabled}
            maxLength={1}
            inputMode={type === "numeric" ? "numeric" : "text"}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
        ))}
      </div>
    );
  },
);

function sanitize(
  raw: string,
  type: PinInputType,
  lettercase?: PinInputCase,
): string {
  if (type === "numeric") return raw.replace(/[^0-9]/g, "");
  const cased =
    lettercase === "uppercase"
      ? raw.toUpperCase()
      : lettercase === "lowercase"
        ? raw.toLowerCase()
        : raw;
  const pattern =
    lettercase === "uppercase"
      ? /[^A-Z0-9]/g
      : lettercase === "lowercase"
        ? /[^a-z0-9]/g
        : /[^a-zA-Z0-9]/g;
  return cased.replace(pattern, "");
}
