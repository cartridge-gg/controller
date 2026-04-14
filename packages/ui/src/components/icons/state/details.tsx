import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const DetailsIcon = memo(
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
                  d="M9.333 4A2.135 2.135 0 0 0 7.2 6.133v8.534c0 1.176.957 2.133 2.133 2.133h5.974c.143 0 .286-.013.426-.043V13.6c0-.59.477-1.067 1.067-1.067h3.157c.03-.14.043-.283.043-.426V6.133A2.135 2.135 0 0 0 17.867 4H9.333ZM16.8 14.667V16.8l3.2-3.2h-3.2v1.067ZM13.867 18.4H8.533A2.933 2.933 0 0 1 5.6 15.467V8c0-.443-.357-.8-.8-.8-.443 0-.8.357-.8.8v7.467A4.534 4.534 0 0 0 8.533 20h5.334c.443 0 .8-.357.8-.8 0-.443-.357-.8-.8-.8Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M8.267 6.133c0-.59.476-1.066 1.066-1.066h8.534c.59 0 1.066.476 1.066 1.066v5.334h-2.666a1.6 1.6 0 0 0-1.6 1.6v2.666H9.333c-.59 0-1.066-.476-1.066-1.066V6.133Zm10.606 6.4c-.053.15-.14.29-.253.404l-2.483 2.483a1.09 1.09 0 0 1-.404.253v-2.606c0-.294.24-.534.534-.534h2.606ZM7.2 6.133v8.534c0 1.176.957 2.133 2.133 2.133h6.05c.567 0 1.11-.223 1.51-.623l2.484-2.484c.4-.4.623-.943.623-1.51v-6.05A2.135 2.135 0 0 0 17.867 4H9.333A2.135 2.135 0 0 0 7.2 6.133Zm7.467 13.334a.535.535 0 0 0-.534-.534H8.267a3.2 3.2 0 0 1-3.2-3.2v-8a.535.535 0 0 0-.534-.533.535.535 0 0 0-.533.533v8A4.266 4.266 0 0 0 8.267 20h5.866c.294 0 .534-.24.534-.533Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

DetailsIcon.displayName = "DetailsIcon";
