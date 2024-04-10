import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const ChromeIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M4 12C4 10.5437 4.38969 9.175 5.07094 7.97187L8.50313 13.9469C9.1875 15.1719 10.4969 16 12 16C12.4469 16 12.8469 15.9281 13.275 15.7937L10.8906 19.925C6.99688 19.3844 4 16.0406 4 12ZM15.4094 14.05C15.7937 13.45 16 12.7219 16 12C16 10.8063 15.475 9.73438 14.6469 9H19.4187C19.7937 9.925 20 10.9406 20 12C20 16.4187 16.4187 19.9719 12 20L15.4094 14.05ZM18.9312 8H12C10.0344 8 8.44688 9.37813 8.07812 11.2094L5.69344 7.07719C7.15625 5.20406 9.4375 4 12 4C14.9625 4 17.5469 5.60875 18.9312 8ZM9.25 12C9.25 10.4812 10.4812 9.25 12 9.25C13.5188 9.25 14.75 10.4812 14.75 12C14.75 13.5188 13.5188 14.75 12 14.75C10.4812 14.75 9.25 13.5188 9.25 12Z"
          className="fill-current"
        />
      </svg>
    ),
  ),
);

ChromeIcon.displayName = "ChromeIcon";
