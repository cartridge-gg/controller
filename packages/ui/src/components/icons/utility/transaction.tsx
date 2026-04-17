import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const TransactionIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 11 9"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M5.31833 0.000198737C5.565 -0.00646793 5.78333 0.155199 5.84833 0.393532L7.08167 4.91353L7.37667 4.32353C7.55667 3.96187 7.92667 3.73353 8.33 3.73353H10.1333C10.4283 3.73353 10.6667 3.97187 10.6667 4.26687C10.6667 4.56187 10.4283 4.8002 10.1333 4.8002H8.33L7.41 6.63853C7.31167 6.83687 7.1 6.95187 6.88 6.9302C6.66 6.90853 6.47667 6.75353 6.41833 6.5402L5.395 2.78853L4.255 8.11187C4.20333 8.35187 3.99667 8.5252 3.75167 8.53353C3.50667 8.54187 3.28833 8.38187 3.22167 8.14687L2.265 4.8002H0.533333C0.238333 4.8002 0 4.56187 0 4.26687C0 3.97187 0.238333 3.73353 0.533333 3.73353H2.265C2.74167 3.73353 3.16 4.04853 3.29 4.50687L3.66 5.8002L4.81167 0.421865C4.86333 0.181865 5.07333 0.0068654 5.31833 0.000198737Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

TransactionIcon.displayName = "TransactionIcon";
