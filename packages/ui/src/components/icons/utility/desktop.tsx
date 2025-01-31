import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const DesktopIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M5.7 5.69995H4.8V6.59995V14.7H6.6V7.49995H17.4V14.7H19.2V6.59995V5.69995H18.3H5.7ZM3 15.6V16.95L4.35 18.3H19.65L21 16.95V15.6H3Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

DesktopIcon.displayName = "DesktopIcon";
