import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const CircleCheckIcon = memo(
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
          d="M11.262 4.032a8.003 8.003 0 0 0-4.919 13.625 8.006 8.006 0 0 0 10.957.338 8.003 8.003 0 0 0 2.668-5.257A8.027 8.027 0 0 0 17.65 6.35a8.027 8.027 0 0 0-6.388-2.318Zm5.035 6.17-4.741 4.693a.761.761 0 0 1-1.063 0l-2.795-2.67a.763.763 0 1 1 1.057-1.1l2.256 2.164 4.222-4.17a.762.762 0 0 1 1.07 1.084h-.006Z"
        />
      </svg>
    ),
  ),
);

CircleCheckIcon.displayName = "CircleCheckIcon";
