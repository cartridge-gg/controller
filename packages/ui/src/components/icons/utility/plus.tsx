import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const PlusIcon = memo(
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
          d="M13.923 20v-6.288H20V10.32h-6.077V4h-3.846v6.321H4v3.39h6.077V20h3.846Z"
        />
      </svg>
    ),
  ),
);

PlusIcon.displayName = "PlusIcon";
