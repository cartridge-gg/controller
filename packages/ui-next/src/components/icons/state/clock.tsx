import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const ClockIcon = memo(
  forwardRef<SVGSVGElement, StateIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 20 20"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        {(() => {
          switch (variant) {
            case "solid":
              return (
                <path
                  className="fill-current"
                  d="M12 20a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8Zm-.75-12.25V12c0 .25.125.484.334.625l3 2a.748.748 0 0 0 1.041-.21.748.748 0 0 0-.21-1.04L12.75 11.6V7.75A.748.748 0 0 0 12 7a.748.748 0 0 0-.75.75Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M18.5 12a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0ZM4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Zm7.25-4.25V12c0 .25.125.484.334.625l3 2a.748.748 0 0 0 1.041-.21.748.748 0 0 0-.21-1.04L12.75 11.6V7.75A.748.748 0 0 0 12 7a.748.748 0 0 0-.75.75Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

ClockIcon.displayName = "ClockIcon";
