"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    completed?: boolean;
    color?: string;
  }
>(({ className, value, completed, color, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className="relative h-2 w-full overflow-hidden rounded-full"
    {...props}
  >
    <ProgressPrimitive.Indicator
      data-completed={!!completed}
      className={cn(
        "h-full w-full flex-1 transition-all rounded-full bg-primary",
        className,
      )}
      style={{
        backgroundColor: completed ? color : undefined,
        transform: `translateX(-${100 - (value && value > 0 ? value : -1)}%)`,
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
