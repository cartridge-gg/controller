import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const MobileIcon = memo(
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
                  xmlns="http://www.w3.org/2000/svg"
                  d="M6.5 6C6.5 4.89688 7.39688 4 8.5 4H15.5C16.6031 4 17.5 4.89688 17.5 6V18C17.5 19.1031 16.6031 20 15.5 20H8.5C7.39688 20 6.5 19.1031 6.5 18V6ZM13 18C13 17.7348 12.8946 17.4804 12.7071 17.2929C12.5196 17.1054 12.2652 17 12 17C11.7348 17 11.4804 17.1054 11.2929 17.2929C11.1054 17.4804 11 17.7348 11 18C11 18.2652 11.1054 18.5196 11.2929 18.7071C11.4804 18.8946 11.7348 19 12 19C12.2652 19 12.5196 18.8946 12.7071 18.7071C12.8946 18.5196 13 18.2652 13 18ZM15.5 6H8.5V16H15.5V6Z"
                  className="fill-current"
                />
              );
            case "line":
              return (
                <path
                  d="M8 18C8 18.275 8.225 18.5 8.5 18.5H15.5C15.775 18.5 16 18.275 16 18V15.5H8V18ZM8 14H16V6C16 5.725 15.775 5.5 15.5 5.5H8.5C8.225 5.5 8 5.725 8 6V14ZM6.5 6C6.5 4.89688 7.39688 4 8.5 4H15.5C16.6031 4 17.5 4.89688 17.5 6V18C17.5 19.1031 16.6031 20 15.5 20H8.5C7.39688 20 6.5 19.1031 6.5 18V6ZM12 16.25C12.1989 16.25 12.3897 16.329 12.5303 16.4697C12.671 16.6103 12.75 16.8011 12.75 17C12.75 17.1989 12.671 17.3897 12.5303 17.5303C12.3897 17.671 12.1989 17.75 12 17.75C11.8011 17.75 11.6103 17.671 11.4697 17.5303C11.329 17.3897 11.25 17.1989 11.25 17C11.25 16.8011 11.329 16.6103 11.4697 16.4697C11.6103 16.329 11.8011 16.25 12 16.25Z"
                  className="fill-current"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

MobileIcon.displayName = "MobileIcon";
