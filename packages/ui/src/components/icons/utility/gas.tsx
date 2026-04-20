import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const GasIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M5 6C5 4.89688 5.89688 4 7 4H12C13.1031 4 14 4.89688 14 6V12H14.25C15.7688 12 17 13.2312 17 14.75V15.75C17 16.1656 17.3344 16.5 17.75 16.5C18.1656 16.5 18.5 16.1656 18.5 15.75V10.9375C17.6375 10.7156 17 9.93125 17 9V7L16 6C15.725 5.725 15.725 5.275 16 5C16.275 4.725 16.725 4.725 17 5L19.4156 7.41563C19.7906 7.79063 20 8.3 20 8.83125V9.25V10V11V15.75C20 16.9937 18.9937 18 17.75 18C16.5063 18 15.5 16.9937 15.5 15.75V14.75C15.5 14.0594 14.9406 13.5 14.25 13.5H14V18C14.5531 18 15 18.4469 15 19C15 19.5531 14.5531 20 14 20H5C4.44687 20 4 19.5531 4 19C4 18.4469 4.44687 18 5 18V6ZM7 6.5V9.5C7 9.775 7.225 10 7.5 10H11.5C11.775 10 12 9.775 12 9.5V6.5C12 6.225 11.775 6 11.5 6H7.5C7.225 6 7 6.225 7 6.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

GasIcon.displayName = "GasIcon";
