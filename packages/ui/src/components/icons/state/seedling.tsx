import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const SeedlingIcon = memo(
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
                  d="M20 5C20 8.55 17.3562 11.4844 13.9312 11.9375C13.7094 10.2688 12.975 8.7625 11.8906 7.58437C13.0875 5.44687 15.375 4 18 4H19C19.5531 4 20 4.44687 20 5ZM4 7C4 6.44688 4.44687 6 5 6H6C9.86562 6 13 9.13438 13 13V14V19C13 19.5531 12.5531 20 12 20C11.4469 20 11 19.5531 11 19V14C7.13438 14 4 10.8656 4 7Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M19 5C19 7.97813 16.8313 10.45 13.9844 10.9187C14.0688 11.2375 14.1313 11.5656 14.175 11.9C17.4813 11.3406 20 8.46562 20 5C20 4.44687 19.5531 4 19 4H18C15.4688 4 13.25 5.34375 12.0188 7.35938C12.2625 7.61875 12.4906 7.89687 12.7 8.18437C13.7094 6.29062 15.7031 5 18 5H19ZM6 7C9.3125 7 12 9.6875 12 13H11C7.6875 13 5 10.3125 5 7H6ZM5 6C4.44687 6 4 6.44688 4 7C4 10.8656 7.13438 14 11 14H12V19.5C12 19.775 12.225 20 12.5 20C12.775 20 13 19.775 13 19.5V14V13.5V13C13 9.13438 9.86562 6 6 6H5Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

SeedlingIcon.displayName = "SeedlingIcon";
