import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const EnvelopeIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M4.6875 5C3.75586 5 3 5.78385 3 6.75C3 7.30052 3.24961 7.81823 3.675 8.15L10.9875 13.8375C11.5887 14.3042 12.4113 14.3042 13.0125 13.8375L20.325 8.15C20.7504 7.81823 21 7.30052 21 6.75C21 5.78385 20.2441 5 19.3125 5H4.6875ZM3 9.8125V16.6667C3 17.9536 4.00898 19 5.25 19H18.75C19.991 19 21 17.9536 21 16.6667V9.8125L14.025 15.2375C12.8262 16.1708 11.1738 16.1708 9.975 15.2375L3 9.8125Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

EnvelopeIcon.displayName = "EnvelopeIcon";
