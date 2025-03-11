import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const TouchIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          className="fill-current"
          d="M17.971 17.667a.708.708 0 0 0 .709-.708v-4.25a6.375 6.375 0 0 0-12.75 0v4.25a.708.708 0 1 0 1.416 0v-4.25a4.959 4.959 0 1 1 9.917 0v4.25a.708.708 0 0 0 .708.708Z"
        />
        <path
          className="fill-current"
          d="M15.136 19.083a.708.708 0 0 0 .709-.708v-5.667a3.542 3.542 0 0 0-7.084 0v5.667a.708.708 0 1 0 1.417 0v-5.667a2.125 2.125 0 1 1 4.25 0v5.667a.708.708 0 0 0 .708.708Z"
        />
        <path
          className="fill-current"
          d="M11.596 12.708v7.084a.708.708 0 1 0 1.416 0v-7.084a.708.708 0 1 0-1.416 0ZM4.228 9.817a.71.71 0 0 0 .934-.367c1.218-2.796 3.954-4.533 7.142-4.533 3.187 0 5.923 1.737 7.141 4.533a.71.71 0 0 0 1.3-.567C19.298 5.563 16.062 3.5 12.305 3.5c-3.758 0-6.993 2.063-8.442 5.383a.71.71 0 0 0 .366.934Z"
        />
      </svg>
    ),
  ),
);

TouchIcon.displayName = "TouchIcon";
