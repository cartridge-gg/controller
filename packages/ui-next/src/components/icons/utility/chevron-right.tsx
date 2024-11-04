import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const ChevronRightIcon = memo(
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
          d="M14.75 12.0003C14.75 12.1762 14.6829 12.3522 14.5486 12.4863L10.4236 16.6113C10.155 16.8798 9.71997 16.8798 9.45142 16.6113C9.18286 16.3427 9.18286 15.9077 9.45142 15.6391L13.0914 12.0003L9.45195 8.36084C9.1834 8.09229 9.1834 7.65723 9.45195 7.38867C9.72051 7.12012 10.1556 7.12012 10.4241 7.38867L14.5491 11.5137C14.6834 11.6479 14.75 11.8241 14.75 12.0003Z"
        />
      </svg>
    ),
  ),
);

ChevronRightIcon.displayName = "ChevronRightIcon";
