import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const TimesCircleIcon = memo(
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
          d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8Zm3.923 10.1a.387.387 0 0 1 0 .548l-1.278 1.275a.387.387 0 0 1-.548 0L12 13.806l-2.1 2.117a.387.387 0 0 1-.548 0l-1.275-1.278a.387.387 0 0 1 0-.548L10.194 12 8.076 9.9a.387.387 0 0 1 0-.548l1.278-1.278a.387.387 0 0 1 .548 0L12 10.194l2.1-2.117a.387.387 0 0 1 .548 0l1.278 1.278a.387.387 0 0 1 0 .548L13.806 12l2.117 2.1Z"
        />
      </svg>
    ),
  ),
);

TimesCircleIcon.displayName = "TimesCircleIcon";
