import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const StackOvalIcon = memo(
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
                <>
                  <path
                    className="fill-current"
                    d="M19.75 8.626c0 2.18-3.47 3.947-7.75 3.947-4.28 0-7.75-1.767-7.75-3.947C4.25 6.447 7.72 4.68 12 4.68c4.28 0 7.75 1.767 7.75 3.946Z"
                  />
                  <path
                    className="fill-current"
                    fillRule="evenodd"
                    d="M19.669 13.347a.662.662 0 0 1-.264.897c-2.107 1.15-4.018 1.917-7.484 1.917-3.485 0-5.266-.883-7.306-1.906a.662.662 0 0 1 .593-1.183c1.976.991 3.536 1.765 6.713 1.765 3.196 0 4.89-.684 6.85-1.754a.662.662 0 0 1 .898.264Z"
                    clipRule="evenodd"
                  />
                  <path
                    className="fill-current"
                    fillRule="evenodd"
                    d="M19.669 16.506a.662.662 0 0 1-.264.897c-2.107 1.15-4.018 1.917-7.484 1.917-3.485 0-5.266-.883-7.306-1.906a.662.662 0 1 1 .593-1.183c1.976.991 3.536 1.765 6.713 1.765 3.196 0 4.89-.684 6.85-1.754a.662.662 0 0 1 .898.264Z"
                    clipRule="evenodd"
                  />
                </>
              );
            case "line":
              return (
                <>
                  <path
                    className="fill-current"
                    fillRule="evenodd"
                    d="M19.669 13.347a.662.662 0 0 1-.264.897c-2.107 1.15-4.018 1.917-7.484 1.917-3.485 0-5.266-.883-7.306-1.906a.662.662 0 0 1 .593-1.183c1.976.991 3.536 1.765 6.713 1.765 3.196 0 4.89-.684 6.85-1.754a.662.662 0 0 1 .898.264Z"
                    clipRule="evenodd"
                  />
                  <path
                    className="fill-current"
                    fillRule="evenodd"
                    d="M19.669 16.506a.662.662 0 0 1-.264.897c-2.107 1.15-4.018 1.917-7.484 1.917-3.485 0-5.266-.883-7.306-1.906a.662.662 0 1 1 .593-1.183c1.976.991 3.536 1.765 6.713 1.765 3.196 0 4.89-.684 6.85-1.754a.662.662 0 0 1 .898.264ZM16.936 10.347c1.267-.645 1.614-1.319 1.614-1.72 0-.402-.348-1.077-1.614-1.722C15.734 6.294 13.99 5.88 12 5.88s-3.734.414-4.936 1.025C5.797 7.55 5.45 8.225 5.45 8.626c0 .402.347 1.076 1.614 1.721 1.202.612 2.945 1.026 4.936 1.026s3.734-.414 4.936-1.026ZM12 12.573c4.28 0 7.75-1.767 7.75-3.947S16.28 4.68 12 4.68c-4.28 0-7.75 1.767-7.75 3.946 0 2.18 3.47 3.947 7.75 3.947Z"
                    clipRule="evenodd"
                  />
                </>
              );
          }
        })()}
      </svg>
    ),
  ),
);

StackOvalIcon.displayName = "StackOvalIcon";
