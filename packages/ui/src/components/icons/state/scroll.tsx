import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const ScrollIcon = memo(
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
                  d="M3 6.5V8c0 .553.447 1 1 1h2V6.5a1.5 1.5 0 0 0-3 0ZM6.5 5c.313.419.5.938.5 1.5V16c0 1.103.897 2 2 2s2-.897 2-2v-.166c0-1.012.822-1.834 1.834-1.834H18V8a3 3 0 0 0-3-3H6.5Zm11 14c1.934 0 3.5-1.566 3.5-3.5 0-.275-.225-.5-.5-.5h-7.666a.834.834 0 0 0-.834.834V16a3 3 0 0 1-3 3h8.5Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M20 14h-2V8.5C18 6.57 16.431 5 14.5 5h-9A2.503 2.503 0 0 0 3 7.5V10c0 .55.45 1 1 1h3v5a2.997 2.997 0 0 0 2.832 2.984l7.75.016A3.42 3.42 0 0 0 21 15.581V15c0-.55-.45-1-1-1ZM7 10H4V7.5a1.5 1.5 0 0 1 3 0V10Zm5 6c0 1.102-.898 2-2 2-1.102 0-2-.898-2-2V7.5c0-.563-.216-1.082-.5-1.5h7C15.878 6 17 7.121 17 8.5V14h-4c-.55 0-1 .45-1 1v1Zm8-.419A2.42 2.42 0 0 1 17.581 18H12.22A2.974 2.974 0 0 0 13 16v-1h7v.581Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

ScrollIcon.displayName = "ScrollIcon";
