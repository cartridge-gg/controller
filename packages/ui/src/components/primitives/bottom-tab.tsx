import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";

const bottomTabVariants = cva("flex flex-col items-center", {
  variants: {
    variant: {
      default:
        "grow text-foreground-300 hover:text-foreground-200 cursor-pointer",
    },
    size: {
      default: "h-16",
    },
    status: {
      active: "text-primary hover:text-primary",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface BottomTabProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bottomTabVariants> {}

export function BottomTab({
  className,
  variant,
  status,
  ...props
}: BottomTabProps) {
  return (
    <div className={cn(bottomTabVariants({ variant, status }), className)}>
      <div
        className={cn(
          "bg-primary h-[2px] w-full rounded-full",
          status !== "active" && "opacity-0",
        )}
      />
      <div
        className="grow w-full flex items-center justify-center"
        {...props}
      />
    </div>
  );
}
