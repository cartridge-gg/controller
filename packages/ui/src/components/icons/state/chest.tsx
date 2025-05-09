import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const ChestIcon = memo(
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
                  d="M3 9V12H7V5C4.79063 5 3 6.79063 3 9ZM3 17.5C3 18.3281 3.67188 19 4.5 19H7V13H3V17.5ZM16 13H14V14C14 14.5531 13.5531 15 13 15H11C10.4469 15 10 14.5531 10 14V13H8V19H16V13ZM19.5 19C20.3281 19 21 18.3281 21 17.5V13H17V19H19.5ZM21 9C21 6.79063 19.2094 5 17 5V12H21V9ZM16 12V5H8V12H10V11C10 10.4469 10.4469 10 11 10H13C13.5531 10 14 10.4469 14 11V12H16ZM12.5 11.5C12.5 11.225 12.275 11 12 11C11.725 11 11.5 11.225 11.5 11.5V13.5C11.5 13.775 11.725 14 12 14C12.275 14 12.5 13.775 12.5 13.5V11.5Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M8 6.5H16V11.5H14V11C14 10.4469 13.5531 10 13 10H11C10.4469 10 10 10.4469 10 11V11.5H8V6.5ZM4.5 9C4.5 7.79063 5.35938 6.78125 6.5 6.55V11.5H4.5V9ZM4.5 17.5V13H6.5V17.5H4.5ZM16 13V17.5H8V13H10V14C10 14.5531 10.4469 15 11 15H13C13.5531 15 14 14.5531 14 14V13H16ZM19.5 17.5H17.5V13H19.5V17.5ZM19.5 9V11.5H17.5V6.55C18.6406 6.78125 19.5 7.79063 19.5 9ZM7 5C4.79063 5 3 6.79063 3 9V17.5C3 18.3281 3.67188 19 4.5 19H19.5C20.3281 19 21 18.3281 21 17.5V9C21 6.79063 19.2094 5 17 5H7ZM12.5 12V13C12.5 13.275 12.275 13.5 12 13.5C11.725 13.5 11.5 13.275 11.5 13V12C11.5 11.725 11.725 11.5 12 11.5C12.275 11.5 12.5 11.725 12.5 12Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

ChestIcon.displayName = "ChestIcon";
