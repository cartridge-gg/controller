import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const GemIcon = memo(
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
                  d="M7.647 5.18a.753.753 0 0 1 .604-.307h7.5c.237 0 .462.113.603.307l3.5 4.75a.754.754 0 0 1-.047.95l-7.25 8a.755.755 0 0 1-.556.247.755.755 0 0 1-.557-.247l-7.25-8a.75.75 0 0 1-.047-.95l3.5-4.75Zm1.204 1.243a.25.25 0 0 0-.066.328l1.794 2.988-4.6.384a.251.251 0 0 0 0 .5l6 .5h.04l6-.5a.251.251 0 0 0 0-.5l-4.597-.38 1.794-2.988a.25.25 0 0 0-.065-.329.254.254 0 0 0-.335.032L12 9.505l-2.815-3.05a.254.254 0 0 0-.334-.032Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M7.999 5a.498.498 0 0 0-.41.213l-3.5 5a.504.504 0 0 0 .044.628l7.5 8a.501.501 0 0 0 .732 0l7.5-8a.496.496 0 0 0 .043-.628l-3.5-5a.498.498 0 0 0-.41-.213h-8Zm.028 1.334L10.958 10h-5.5l2.569-3.666ZM5.652 11h12.694l-6.347 6.769L5.652 11Zm12.884-1h-5.5l2.935-3.666L18.539 10h-.003Zm-3.578-4-2.96 3.7L9.04 6h5.92Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

GemIcon.displayName = "GemIcon";
