import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const PlusIcon = memo(
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
                  d="M13.9227 20V13.7119H20V10.321H13.9227V4H10.0773V10.321H4V13.7119H10.0773V20H13.9227Z"
                  className="fill-current"
                />
              );
            case "line":
              return (
                <path
                  d="M11 20H13V13H20V11H13V4H11V11H4V13H11V20Z"
                  className="fill-current"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

PlusIcon.displayName = "PlusIcon";
