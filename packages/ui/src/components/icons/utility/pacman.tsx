import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const PacmanIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fill="currentColor"
          d="M19.391 15.062a8 8 0 1 1 0-6.123L12 12l7.391 3.062Z"
        />
      </svg>
    ),
  ),
);

PacmanIcon.displayName = "PacmanIcon";
