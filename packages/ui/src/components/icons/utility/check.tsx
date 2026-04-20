import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const CheckIcon = memo(
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
          d="M8.364 18.546 4 14.182l1.454-1.454 2.91 2.91L18.546 5.453 20 6.91 8.364 18.546Z"
        />
      </svg>
    ),
  ),
);

CheckIcon.displayName = "CheckIcon";
