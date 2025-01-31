import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const ChevronLeftIcon = memo(
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
          d="M9.25 11.9996C9.25 11.8237 9.31714 11.6477 9.45142 11.5137L13.5764 7.38867C13.845 7.12012 14.28 7.12012 14.5486 7.38867C14.8171 7.65723 14.8171 8.09229 14.5486 8.36084L10.9086 11.9996L14.548 15.6391C14.8166 15.9077 14.8166 16.3427 14.548 16.6113C14.2795 16.8798 13.8444 16.8798 13.5759 16.6113L9.45088 12.4863C9.3166 12.352 9.25 12.1758 9.25 11.9996Z"
        />
      </svg>
    ),
  ),
);

ChevronLeftIcon.displayName = "ChevronLeftIcon";
