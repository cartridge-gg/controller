import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const StackDiamondIcon = memo(
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
                  d="M11.658 3a.565.565 0 0 0-.274.087l-7.11 4.447a.563.563 0 0 0 0 .957l7.11 4.446a.562.562 0 0 0 .598 0L19.09 8.49a.563.563 0 0 0 0-.957l-7.108-4.447a.56.56 0 0 0-.324-.086Zm-7.105 8.858a.563.563 0 0 0-.278 1.041l7.11 4.452a.563.563 0 0 0 .597 0l7.109-4.452a.563.563 0 0 0-.598-.954l-6.81 4.265-6.81-4.266a.556.556 0 0 0-.32-.086Zm0 3.563a.563.563 0 0 0-.278 1.046l7.11 4.448a.565.565 0 0 0 .597 0l7.109-4.448a.564.564 0 0 0-.598-.955l-6.81 4.264-6.81-4.264a.559.559 0 0 0-.32-.091Z"
                />
              );
            case "line":
              return (
                <>
                  <path
                    className="fill-current"
                    fillRule="evenodd"
                    d="m19.09 7.534-7.108-4.447a.56.56 0 0 0-.598 0l-7.11 4.447a.563.563 0 0 0 0 .957l7.11 4.446a.562.562 0 0 0 .598 0L19.09 8.49a.563.563 0 0 0 0-.957Zm-7.407-3.218 5.91 3.696-5.91 3.696-5.91-3.696 5.91-3.696Z"
                    clipRule="evenodd"
                  />
                  <path
                    className="fill-current"
                    d="M4.553 11.858a.563.563 0 0 0-.278 1.041l7.11 4.452a.563.563 0 0 0 .597 0l7.109-4.452a.563.563 0 0 0-.598-.954l-6.81 4.265-6.81-4.266a.556.556 0 0 0-.32-.086Zm0 3.563a.563.563 0 0 0-.278 1.046l7.11 4.448a.565.565 0 0 0 .597 0l7.109-4.448a.564.564 0 0 0-.598-.955l-6.81 4.264-6.81-4.264a.559.559 0 0 0-.32-.091Z"
                  />
                </>
              );
          }
        })()}
      </svg>
    ),
  ),
);

StackDiamondIcon.displayName = "StackDiamondIcon";
