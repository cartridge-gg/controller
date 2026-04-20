import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const PlayIcon = memo(
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
          d="M16.527 10.903c.383.235.617.65.617 1.098 0 .447-.233.863-.617 1.074L8.813 17.79a1.236 1.236 0 0 1-1.3.049 1.286 1.286 0 0 1-.657-1.123v-9.43a1.286 1.286 0 0 1 1.957-1.097l7.714 4.714Z"
        />
      </svg>
    ),
  ),
);

PlayIcon.displayName = "PlayIcon";
