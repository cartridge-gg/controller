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
                  d="M8.5 4C8.775 4 9 4.225 9 4.5V6H15V4.5C15 4.225 15.225 4 15.5 4C15.775 4 16 4.225 16 4.5V6H17C18.1031 6 19 6.89687 19 8V9V10V18C19 19.1031 18.1031 20 17 20H7C5.89688 20 5 19.1031 5 18V10V9V8C5 6.89687 5.89688 6 7 6H8V4.5C8 4.225 8.225 4 8.5 4ZM18 10H6V18C6 18.5531 6.44687 19 7 19H17C17.5531 19 18 18.5531 18 18V10ZM17 7H7C6.44687 7 6 7.44688 6 8V9H18V8C18 7.44688 17.5531 7 17 7Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

CalendarIcon.displayName = "CalendarIcon";
