import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { DirectionalIconProps } from "../types";

export const CaratIcon = memo(
  forwardRef<SVGSVGElement, DirectionalIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        {(() => {
          switch (variant) {
            case "up":
              return (
                <path className="fill-current" d="m8 13.6 4-4 4 4v.8H8v-.8Z" />
              );
            case "right":
              return (
                <path className="fill-current" d="m10.4 8 4 4-4 4h-.8V8h.8Z" />
              );
            case "down":
              return (
                <path className="fill-current" d="m16 10.4-4 4-4-4v-.8h8v.8Z" />
              );
            case "left":
              return (
                <path className="fill-current" d="m13.6 16-4-4 4-4h.8v8h-.8Z" />
              );
          }
        })()}
      </svg>
    ),
  ),
);

CaratIcon.displayName = "CaratIcon";
