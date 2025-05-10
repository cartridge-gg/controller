import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const FilterIcon = memo(
  forwardRef<SVGSVGElement, StateIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
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
                  d="M4.122 5.715A1.245 1.245 0 0 1 5.25 5h13.502a1.253 1.253 0 0 1 .966 2.044L14 14.029V18a.998.998 0 0 1-1.6.8l-2-1.5a.993.993 0 0 1-.4-.8v-2.472L4.28 7.04a1.247 1.247 0 0 1-.16-1.325Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M4 6.235C4 5.553 4.553 5 5.235 5h13.53a1.235 1.235 0 0 1 .95 2.023L14 13.93v4.01a1.06 1.06 0 0 1-1.71.837l-1.902-1.484a.993.993 0 0 1-.388-.788v-2.575L4.284 7.023A1.235 1.235 0 0 1 4 6.235ZM5.235 6a.235.235 0 0 0-.18.385l5.83 7.046a.5.5 0 0 1 .115.319v2.756l1.878 1.482c.038.009.05.012.063.012.034 0 .059-.025.059-.06v-4.19a.5.5 0 0 1 .116-.319l5.83-7.046A.236.236 0 0 0 18.766 6H5.236Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

FilterIcon.displayName = "FilterIcon";
