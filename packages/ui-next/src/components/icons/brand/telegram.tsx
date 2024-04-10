import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const TelegramIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M18.6979 4.92203C18.4249 4.69059 17.9963 4.65747 17.553 4.83542H17.5523C17.0861 5.02246 4.35691 10.4824 3.83872 10.7055C3.74447 10.7382 2.92133 11.0454 3.00612 11.7295C3.08181 12.3463 3.74338 12.6018 3.82416 12.6313L7.06033 13.7393C7.27503 14.454 8.06651 17.0909 8.24155 17.6542C8.35072 18.0053 8.52867 18.4668 8.84053 18.5617C9.11418 18.6673 9.38638 18.5708 9.56251 18.4326L11.541 16.5974L14.735 19.0883L14.811 19.1338C15.0279 19.2299 15.2357 19.2779 15.434 19.2779C15.5872 19.2779 15.7343 19.2491 15.8747 19.1916C16.3533 18.9951 16.5447 18.5392 16.5647 18.4875L18.9504 6.08687C19.096 5.42457 18.8936 5.0876 18.6979 4.92203ZM9.9144 14.1826L8.8227 17.0938L7.731 13.4548L16.1007 7.26846L9.9144 14.1826Z"
          className="fill-current"
        />
      </svg>
    ),
  ),
);

TelegramIcon.displayName = "TelegramIcon";
