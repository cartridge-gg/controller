import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const MinusIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path fill="currentColor" d="M20 13.712v-3.391H4v3.391h16Z" />
      </svg>
    ),
  ),
);

MinusIcon.displayName = "MinusIcon";
