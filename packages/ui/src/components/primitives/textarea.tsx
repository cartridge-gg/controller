import * as React from "react";

import { cn } from "@/utils";
import { Clear } from "./clear";
import { cva, VariantProps } from "class-variance-authority";
import { ErrorMessage } from "@/index";

export const textareaVariants = cva(
  "flex w-full resize-none overflow-hidden rounded-md border px-4 font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-inner-spin-button]:appearance-none",
  {
    variants: {
      variant: {
        default:
          "border bg-background-200 border-background-300 text-foreground-100 hover:border-background-400 focus-visible:border-primary focus-visible:bg-background-300 placeholder:text-foreground-400",
        username:
          "border bg-background-200 border-background-300 text-foreground-100 placeholder:text-foreground-400",
      },
      size: {
        // The is no text alignment in the textarea, so we need to use padding from top to align the text taking line-height into account
        default: "py-[10.3px] min-h-10 h-10 text-sm/[18px]",
        lg: "py-[13.3px] min-h-12 h-12 text-[15px]/5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  error?: Error;
  isLoading?: boolean;
  onClear?: () => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, isLoading, onClear, variant, size, className, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(ref, () => internalRef.current!);

    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.style.height = "1px";
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    }, [props.value]);

    const [isFocused, setIsFocused] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <div className="flex flex-col gap-y-3">
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <textarea
            className={cn(
              textareaVariants({ variant, size, className }),
              !!props.value && !!onClear && "pr-12",
              !!error &&
                "border-destructive-100 hover:border-destructive-100 focus-visible:border-destructive-100",
            )}
            ref={internalRef}
            {...props}
          />
          {(isFocused || isHovered) && !!props.value && !!onClear && (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <Clear isLoading={!!isLoading} onClear={onClear} />
            </div>
          )}
        </div>
        {!!error && <ErrorMessage label={error.message} />}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
