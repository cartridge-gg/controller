import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const WarningIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M20.799 17.5356L13.2999 4.73831C12.7258 3.7539 11.277 3.7539 10.699 4.73831L3.2034 17.5356C2.62646 18.5165 3.34505 19.7506 4.50141 19.7506H19.4996C20.6514 19.7506 21.3721 18.5201 20.799 17.5356ZM11.1553 8.78142C11.1553 8.31559 11.5333 7.93764 11.9991 7.93764C12.4649 7.93764 12.8429 8.31734 12.8429 8.78142V13.2816C12.8429 13.7474 12.4649 14.1254 12.0307 14.1254C11.5966 14.1254 11.1553 13.7492 11.1553 13.2816V8.78142ZM11.9991 17.5005C11.3888 17.5005 10.8938 17.0055 10.8938 16.3951C10.8938 15.7848 11.3884 15.2898 11.9991 15.2898C12.6098 15.2898 13.1045 15.7848 13.1045 16.3951C13.1031 17.0048 12.6108 17.5005 11.9991 17.5005Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

WarningIcon.displayName = "WarningIcon";
