import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const LaptopIcon = memo(
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
                  d="M7.2 6.40039C6.3175 6.40039 5.6 7.11789 5.6 8.00039V14.4004H7.2V8.00039H16.8V14.4004H18.4V8.00039C18.4 7.11789 17.6825 6.40039 16.8 6.40039H7.2ZM4.48 15.2004C4.215 15.2004 4 15.4154 4 15.6804C4 16.7404 4.86 17.6004 5.92 17.6004H18.08C19.14 17.6004 20 16.7404 20 15.6804C20 15.4154 19.785 15.2004 19.52 15.2004H4.48Z"
                  className="fill-current"
                />
              );
            case "line":
              return (
                <path
                  d="M16.8 7.60039H7.2C6.98 7.60039 6.8 7.78039 6.8 8.00039V13.6004H5.6V8.00039C5.6 7.11789 6.3175 6.40039 7.2 6.40039H16.8C17.6825 6.40039 18.4 7.11789 18.4 8.00039V13.6004H17.2V8.00039C17.2 7.78039 17.02 7.60039 16.8 7.60039ZM6.4 16.4004H17.6C18.1225 16.4004 18.5675 16.0654 18.7325 15.6004H5.2675C5.4325 16.0654 5.8775 16.4004 6.4 16.4004ZM4 15.2004C4 14.7579 4.3575 14.4004 4.8 14.4004H19.2C19.6425 14.4004 20 14.7579 20 15.2004C20 16.5254 18.925 17.6004 17.6 17.6004H6.4C5.075 17.6004 4 16.5254 4 15.2004Z"
                  className="fill-current"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

LaptopIcon.displayName = "LaptopIcon";
