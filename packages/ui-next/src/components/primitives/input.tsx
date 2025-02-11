import * as React from "react";

import { cn } from "@/utils";
import { Clear } from "./clear";
import { cva, VariantProps } from "class-variance-authority";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  isLoading?: boolean;
  onClear?: () => void;
}

export const inputVariants = cva(
  "flex w-full rounded-md border px-4 py-3.5 font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-background-200",
      },
      size: {
        default: "h-10 text-sm/[18px]",
        lg: "h-12 text-[15px]/5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ isLoading, onClear, variant, size, className, type, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          type={type}
          className={cn(inputVariants({ variant, size, className }))}
          {...props}
        />
        {!!props.value && !!onClear && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <Clear isLoading={!!isLoading} onClear={onClear} />
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
