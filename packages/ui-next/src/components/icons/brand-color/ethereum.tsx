import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const EthereumColorIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fill="#627EEA"
          d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11Z"
        />
        <path
          fill="#fff"
          fillOpacity=".602"
          d="M11.999 4v5.915l4.999 2.233-5-8.148Z"
        />
        <path fill="#fff" d="m11.999 4-5 8.148 5-2.233V4Z" />
        <path
          fill="#fff"
          fillOpacity=".602"
          d="M11.999 15.981V20L17 13.08 12 15.98Z"
        />
        <path fill="#fff" d="M11.999 20v-4.02l-5-2.9 5 6.92Z" />
        <path
          fill="#fff"
          fillOpacity=".2"
          d="m11.999 15.051 4.999-2.903-5-2.232v5.135Z"
        />
        <path
          fill="#fff"
          fillOpacity=".602"
          d="m6.999 12.148 5 2.903V9.916l-5 2.232Z"
        />
      </svg>
    ),
  ),
);

EthereumColorIcon.displayName = "EthereumColorIcon";
