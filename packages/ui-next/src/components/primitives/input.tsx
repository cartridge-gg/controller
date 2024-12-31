import * as React from "react";

import { cn } from "@/utils";
import { TimesCircleIcon } from "../icons";
import { Button } from "./button";
import { Spinner } from "../spinner";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isLoading?: boolean;
  onClear?: () => void;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ isLoading, onClear, className, type, ...props }, ref) => {
    return (
      <>
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-quaternary px-4 py-3.5 text-md ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        {isLoading && (
          <Spinner size="lg" className="absolute top-[18px] right-4" />
        )}
        {!isLoading && onClear && (
          <Button
            variant="icon"
            size="icon"
            className="absolute top-3.5 right-3 bg-transparent hover:bg-transparent text-muted-foreground"
            onClick={onClear}
          >
            <TimesCircleIcon />
          </Button>
        )}
      </>
    );
  },
);
Input.displayName = "Input";

export { Input };
