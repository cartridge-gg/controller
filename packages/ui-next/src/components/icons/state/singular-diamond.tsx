import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const SingularDiamondIcon = memo(
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
                  d="M11.975 4.99a.565.565 0 0 0-.274.086l-7.109 6.447a.563.563 0 0 0 0 .956l7.11 6.446a.563.563 0 0 0 .597 0l7.108-6.446a.563.563 0 0 0 .001-.956l-7.109-6.447a.56.56 0 0 0-.324-.087Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  fillRule="evenodd"
                  d="m5.851 12.001 6.15 5.575 6.148-5.575L12 6.425 5.851 12ZM12.3 5.076l7.109 6.447a.563.563 0 0 1 0 .956l-7.109 6.446a.563.563 0 0 1-.598 0L4.592 12.48a.563.563 0 0 1 0-.956l7.11-6.447a.56.56 0 0 1 .598 0Z"
                  clipRule="evenodd"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

SingularDiamondIcon.displayName = "SingularDiamondIcon";
