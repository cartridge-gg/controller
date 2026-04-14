import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const ChessIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M6.00005 15V17.4H18V10.2C18 6.225 14.775 3 10.8 3H4.80005V3.6L5.40005 4.8L4.80005 5.4V11.7L7.80005 12.9L9.00005 12.3L9.60005 10.2L10.8 9.6V12.6L6.00005 15ZM7.50005 7.35C7.50005 7.7625 7.16255 8.1 6.75005 8.1C6.33755 8.1 6.00005 7.7625 6.00005 7.35C6.00005 6.9375 6.33755 6.6 6.75005 6.6C7.16255 6.6 7.50005 6.9375 7.50005 7.35ZM18 18.6H6.00005H4.80005V21H6.00005H18H19.2V18.6H18Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

ChessIcon.displayName = "ChessIcon";
