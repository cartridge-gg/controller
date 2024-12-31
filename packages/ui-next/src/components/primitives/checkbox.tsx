"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/utils";
import { CheckboxIcon } from "../icons";
import { iconVariants, size } from "../icons/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    size?: keyof typeof size;
  }
>(({ className, checked, size, ...props }, ref) => {
  const iconStyle = iconVariants({ size });
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer flex items-center justify-center shrink-0 rounded-sm disabled:cursor-not-allowed disabled:opacity-50",
        iconStyle,
      )}
      checked={checked}
      {...props}
    >
      <CheckboxIcon
        className={cn(iconStyle, className)}
        variant={
          checked === "indeterminate"
            ? "minus-line"
            : checked
            ? "line"
            : "unchecked-line"
        }
      />
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
