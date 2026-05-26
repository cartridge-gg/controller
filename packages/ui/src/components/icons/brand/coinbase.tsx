import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const CoinbaseIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M12.015 16C9.8009 16 8.00751 14.21 8.00751 12C8.00751 9.79 9.8009 8 12.015 8C13.9987 8 15.6452 9.44335 15.9625 11.3334H20C19.6594 7.22667 16.2162 4 12.015 4C7.59007 4 4 7.58333 4 12C4 16.4166 7.59007 20 12.015 20C16.2162 20 19.6594 16.7733 20 12.6666H15.9625C15.6452 14.5567 13.9987 16 12.015 16Z"
          fill="white"
        />
      </svg>
    ),
  ),
);

CoinbaseIcon.displayName = "CoinbaseIcon";
