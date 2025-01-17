import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const AlertIcon = memo(
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
          d="m12 3-9 9 9 9 9-9-9-9Zm.844 4.5v5.625h-1.688V7.5h1.688Zm-1.688 8.438V14.25h1.688v1.688h-1.688Z"
        />
      </svg>
    ),
  ),
);

AlertIcon.displayName = "AlertIcon";
