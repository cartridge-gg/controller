import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const DoubleWedgeIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M7.07351 6.38401C6.75714 6.172 6.32881 6.25661 6.1168 6.57298C5.90479 6.88935 5.9894 7.31768 6.30577 7.52969L12 11.3455L17.6942 7.52969C18.0106 7.31768 18.0952 6.88934 17.8832 6.57298C17.6712 6.25661 17.2429 6.17201 16.9265 6.38401L12 9.68538L7.07351 6.38401Z"
          fill="currentColor"
        />
        <path
          d="M7.07351 12.7712C6.75714 12.5592 6.32881 12.6438 6.1168 12.9601C5.90479 13.2765 5.9894 13.7048 6.30577 13.9168L12 17.7327L17.6942 13.9168C18.0106 13.7048 18.0952 13.2765 17.8832 12.9601C17.6712 12.6438 17.2429 12.5592 16.9265 12.7712L12 16.0725L7.07351 12.7712Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

DoubleWedgeIcon.displayName = "DoubleWedgeIcon";
