import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const CalendarIcon = memo(
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
                  d="M8 5V6H6.5C5.67188 6 5 6.67188 5 7.5V9H19V7.5C19 6.67188 18.3281 6 17.5 6H16V5C16 4.44687 15.5531 4 15 4C14.4469 4 14 4.44687 14 5V6H10V5C10 4.44687 9.55312 4 9 4C8.44688 4 8 4.44687 8 5ZM19 10H5V18.5C5 19.3281 5.67188 20 6.5 20H17.5C18.3281 20 19 19.3281 19 18.5V10Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M9.75 4.75C9.75 4.33437 9.41563 4 9 4C8.58437 4 8.25 4.33437 8.25 4.75V6H7C5.89688 6 5 6.89687 5 8V8.5V10V18C5 19.1031 5.89688 20 7 20H17C18.1031 20 19 19.1031 19 18V10V8.5V8C19 6.89687 18.1031 6 17 6H15.75V4.75C15.75 4.33437 15.4156 4 15 4C14.5844 4 14.25 4.33437 14.25 4.75V6H9.75V4.75ZM6.5 10H17.5V18C17.5 18.275 17.275 18.5 17 18.5H7C6.725 18.5 6.5 18.275 6.5 18V10Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

CalendarIcon.displayName = "CalendarIcon";
