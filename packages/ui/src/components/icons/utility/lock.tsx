import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const LockIcon = memo(
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
          d="M9.5 8.5V10h5V8.5a2.5 2.5 0 1 0-5 0Zm-2 1.5V8.5a4.501 4.501 0 0 1 9 0V10h.5c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2H7c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h.5Z"
        />
      </svg>
    ),
  ),
);

LockIcon.displayName = "LockIcon";
