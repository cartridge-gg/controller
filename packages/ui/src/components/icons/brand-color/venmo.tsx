import { forwardRef, memo } from "react";
import { IconProps } from "../types";
import { iconVariants } from "../utils";

export const VenmoColorIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M18.6545 4L13.6363 5.01818C13.9272 5.70909 14.1454 6.50909 14.1454 7.70909C14.1454 9.89091 12.6181 13.0909 11.3454 15.1273L9.99993 4.36364L4.47266 4.90909L7.01811 20H13.3454C16.1454 16.3636 19.5272 11.1636 19.5272 7.2C19.5272 5.96364 19.2363 4.98182 18.6545 4Z"
          fill="#008CFF"
        />
      </svg>
    ),
  ),
);

VenmoColorIcon.displayName = "VenmoColorIcon";
