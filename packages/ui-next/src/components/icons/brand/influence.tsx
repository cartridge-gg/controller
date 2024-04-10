import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const InfluenceIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M18.1227 5.87737L16.4208 5.15179H14.7214L15.818 5.62387L15.4701 5.87737L15.818 6.13088L14.7214 6.60267H16.4208L18.1227 5.87737Z"
          className="fill-current"
        />
        <path
          d="M18.1227 11.9999C18.1227 14.3445 16.2222 16.245 13.8778 16.245V7.75487C16.2222 7.75487 18.1227 9.65539 18.1227 11.9999Z"
          className="fill-current"
        />
        <path
          d="M13.8289 18.4534C10.2704 18.4534 7.37477 15.5582 7.37477 11.9999C7.37477 8.44141 10.2704 5.54632 13.8289 5.54632C13.8454 5.54632 13.8614 5.54873 13.8778 5.55117V4C9.45919 4 5.87744 7.5819 5.87744 11.9999C5.87744 16.4182 9.45919 20 13.8778 20V18.4486C13.8614 18.4509 13.8454 18.4534 13.8289 18.4534Z"
          className="fill-current"
        />
        <path
          d="M9.63274 11.9999C9.63274 9.65539 11.5334 7.75487 13.8778 7.75487L13.8777 6.20528C13.8614 6.20772 13.8454 6.21025 13.8289 6.21025C10.6363 6.21025 8.03901 8.80754 8.03901 11.9999C8.03901 15.1921 10.6363 17.7893 13.8289 17.7893C13.8454 17.7893 13.8614 17.7916 13.8777 17.7944L13.8778 16.245C11.5334 16.245 9.63274 14.3445 9.63274 11.9999Z"
          className="fill-current"
        />
      </svg>
    ),
  ),
);

InfluenceIcon.displayName = "InfluenceIcon";
