import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const WrenchIcon = memo(
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
                  d="M15 14a4.999 4.999 0 0 0 4.806-6.381c-.097-.338-.512-.413-.76-.166l-2.4 2.4a.502.502 0 0 1-.352.147H14.5a.501.501 0 0 1-.5-.5V7.706c0-.131.053-.26.147-.353l2.4-2.4c.247-.247.169-.662-.166-.76A4.999 4.999 0 0 0 10 9c0 .598.106 1.173.297 1.704l-5.675 5.675a2.122 2.122 0 1 0 3 3l5.675-5.675A4.964 4.964 0 0 0 15 14Zm-8.5 2.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M19 9c0-.334-.04-.66-.119-.969L17.353 9.56a1.5 1.5 0 0 1-1.06.441H15.5A1.5 1.5 0 0 1 14 8.5v-.794c0-.397.16-.778.44-1.06L15.97 5.12a4 4 0 0 0-4.881 4.716c.1.474-.02 1.012-.41 1.402l-5.247 5.244a1.474 1.474 0 1 0 2.087 2.088l5.248-5.247c.387-.388.928-.51 1.403-.41A4 4 0 0 0 19.003 9H19Zm1 0a4.999 4.999 0 0 1-6.04 4.89.53.53 0 0 0-.488.138l-5.247 5.247a2.477 2.477 0 0 1-3.5-3.5l5.247-5.247a.53.53 0 0 0 .137-.487A4.999 4.999 0 0 1 15 4c.776-.001 1.51.177 2.167.49.287.137.328.515.103.74l-2.122 2.122a.502.502 0 0 0-.147.353V8.5c0 .275.225.5.5.5h.794c.131 0 .26-.053.353-.147l2.122-2.122c.225-.225.603-.184.74.103C19.825 7.491 20 8.225 20 9ZM6.75 16.75a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

WrenchIcon.displayName = "WrenchIcon";
