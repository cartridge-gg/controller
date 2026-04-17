import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const BaseIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M11.986 20C16.412 20 20 16.4182 20 12C20 7.58171 16.412 4 11.986 4C7.78691 4 4.34212 7.22394 4 11.3275H14.5926V12.6724H4C4.34212 16.7761 7.78691 20 11.986 20Z"
          className="fill-current"
        />
      </svg>
    ),
  ),
);

BaseIcon.displayName = "BaseIcon";
