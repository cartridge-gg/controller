import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const ShopIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 30 30"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M5.04375 13.4375H24.9527C25.6664 13.4375 26.2465 12.8735 26.2465 12.1797C26.2465 11.9302 26.1691 11.6875 26.0285 11.4824L23.3742 7.60645C23.0613 7.14844 22.5375 6.875 21.9715 6.875H8.02852C7.46602 6.875 6.93867 7.14844 6.62578 7.60645L3.96797 11.479C3.82734 11.6875 3.75 11.9302 3.75 12.1763C3.75 12.8735 4.33008 13.4375 5.04375 13.4375ZM6 14.5312V20V22.7344C6 23.6401 6.75586 24.375 7.6875 24.375H15.5625C16.4941 24.375 17.25 23.6401 17.25 22.7344V20V14.5312H15V20H8.25V14.5312H6ZM21.75 14.5312V23.2812C21.75 23.8862 22.2527 24.375 22.875 24.375C23.4973 24.375 24 23.8862 24 23.2812V14.5312H21.75Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

ShopIcon.displayName = "ShopIcon";
