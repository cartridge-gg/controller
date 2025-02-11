import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-1 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-background-200 text-foreground hover:bg-background-200/80",
        primary:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        muted:
          "border-transparent bg-background-200 text-foreground-400 hover:bg-background-200/80",
        destructive:
          "border-transparent bg-destructive-foreground text-destructive-100 shadow hover:bg-destructive-foreground/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
