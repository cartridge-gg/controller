import { forwardRef, memo } from "react";
import { IconProps } from "../types";
import { iconVariants } from "../utils";

export const CoinbaseWalletColorIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 12C4 16.4183 7.58171 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58171 16.4183 4 12 4C7.58171 4 4 7.58171 4 12ZM9.95556 9.42222C9.661 9.42222 9.42222 9.661 9.42222 9.95556V14.0444C9.42222 14.339 9.661 14.5778 9.95556 14.5778H14.0444C14.339 14.5778 14.5778 14.339 14.5778 14.0444V9.95556C14.5778 9.661 14.339 9.42222 14.0444 9.42222H9.95556Z"
          fill="#0052FF"
        />
      </svg>
    ),
  ),
);

CoinbaseWalletColorIcon.displayName = "CoinbaseWalletColorIcon";
