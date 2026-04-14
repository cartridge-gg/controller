import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const ConnectIcon = memo(
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
                  d="M3 6.5A1.5 1.5 0 0 1 4.5 5h3A1.5 1.5 0 0 1 9 6.5V7h6v-.5A1.5 1.5 0 0 1 16.5 5h3A1.5 1.5 0 0 1 21 6.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 15 9.5V9H9v.5c0 .053-.003.106-.01.156L11.5 13h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3c0-.053.003-.106.01-.156L7.5 11h-3A1.5 1.5 0 0 1 3 9.5v-3Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M8.744 10.16 11 13.168c.228-.11.481-.169.75-.169h2.5c.966 0 1.75.784 1.75 1.75v2.5c0 .966-.784 1.75-1.75 1.75h-2.5c-.966 0-1.75-.784-1.75-1.75v-2.5c0-.334.066-.644.256-.91l-2.284-3.009c-.2.11-.453.169-.722.169h-2.5A1.75 1.75 0 0 1 3 9.25v-2.5C3 5.783 3.783 5 4.75 5h2.5C8.216 5 9 5.783 9 6.75v.75h6v-.75c0-.967.784-1.75 1.75-1.75h2.5c.966 0 1.75.783 1.75 1.75v2.5c0 .966-.784 1.75-1.75 1.75h-2.5c-.966 0-1.75-.784-1.75-1.75V8.5H9v.75c0 .334-.094.644-.256.91ZM7.25 6h-2.5a.75.75 0 0 0-.75.75v2.5c0 .416.336.75.75.75h2.5c.416 0 .75-.334.75-.75v-2.5A.75.75 0 0 0 7.25 6Zm9.5 4h2.5c.416 0 .75-.334.75-.75v-2.5a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v2.5c0 .416.334.75.75.75Zm-2.5 4h-2.5a.748.748 0 0 0-.75.75v2.5c0 .416.334.75.75.75h2.5c.416 0 .75-.334.75-.75v-2.5a.748.748 0 0 0-.75-.75Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

ConnectIcon.displayName = "ConnectIcon";
