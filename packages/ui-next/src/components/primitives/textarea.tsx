import * as React from "react";

import { cn } from "@/utils";
import { Clear } from "./clear";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    isLoading?: boolean;
    onClear?: () => void;
  };

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ isLoading, onClear, className, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm placeholder:text-foreground-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        {!!onClear && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <Clear isLoading={!!isLoading} onClear={onClear} />
          </div>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
