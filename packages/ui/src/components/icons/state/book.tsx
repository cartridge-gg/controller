import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const BookIcon = memo(
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
                  d="M8 4C6.34375 4 5 5.34375 5 7V17C5 18.6562 6.34375 20 8 20H17H18C18.5531 20 19 19.5531 19 19C19 18.4469 18.5531 18 18 18V16C18.5531 16 19 15.5531 19 15V5C19 4.44687 18.5531 4 18 4H17H8ZM8 16H16V18H8C7.44688 18 7 17.5531 7 17C7 16.4469 7.44688 16 8 16ZM9 8.5C9 8.225 9.225 8 9.5 8H15.5C15.775 8 16 8.225 16 8.5C16 8.775 15.775 9 15.5 9H9.5C9.225 9 9 8.775 9 8.5ZM9.5 10H15.5C15.775 10 16 10.225 16 10.5C16 10.775 15.775 11 15.5 11H9.5C9.225 11 9 10.775 9 10.5C9 10.225 9.225 10 9.5 10Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M7 4C5.89688 4 5 4.89688 5 6V18C5 19.1031 5.89688 20 7 20H18.5C18.775 20 19 19.775 19 19.5C19 19.225 18.775 19 18.5 19H18V16.9156C18.5813 16.7094 19 16.1531 19 15.5V5.5C19 4.67188 18.3281 4 17.5 4H7ZM17 17V19H7C6.44687 19 6 18.5531 6 18C6 17.4469 6.44687 17 7 17H17ZM7 16C6.63437 16 6.29375 16.0969 6 16.2688V6C6 5.44687 6.44687 5 7 5H8V16H7ZM9 16V5H17.5C17.775 5 18 5.225 18 5.5V15.5C18 15.775 17.775 16 17.5 16H9ZM10.5 8.5C10.5 8.775 10.725 9 11 9H16C16.275 9 16.5 8.775 16.5 8.5C16.5 8.225 16.275 8 16 8H11C10.725 8 10.5 8.225 10.5 8.5ZM10.5 11.5C10.5 11.775 10.725 12 11 12H16C16.275 12 16.5 11.775 16.5 11.5C16.5 11.225 16.275 11 16 11H11C10.725 11 10.5 11.225 10.5 11.5Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

BookIcon.displayName = "BookIcon";
