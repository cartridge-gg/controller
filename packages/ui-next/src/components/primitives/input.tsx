import * as React from "react";

import { cn } from "@/utils";
import { Clear } from "./clear";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isLoading?: boolean;
  onClear?: () => void;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ isLoading, onClear, className, type, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background-200 px-4 py-3.5 font-mono text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
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
