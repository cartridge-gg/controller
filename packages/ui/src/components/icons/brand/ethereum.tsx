import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const EthereumIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M16.7469 12.15L12 15.05L7.25 12.15L12 4L16.7469 12.15ZM12 15.9812L7.25 13.0813L12 20L16.75 13.0813L12 15.9812Z"
          className="fill-current"
        />
      </svg>
    ),
  ),
);

EthereumIcon.displayName = "EthereumIcon";
