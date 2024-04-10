import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const EthereumDarkIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fill="#fff"
          fillOpacity=".06"
          d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11Z"
        />
        <path
          fill="#fff"
          fillOpacity=".6"
          d="M11.999 4v5.915l4.999 2.234-5-8.149Z"
        />
        <path fill="#fff" d="m11.999 4-5 8.149 5-2.234V4Z" />
        <path
          fill="#fff"
          fillOpacity=".6"
          d="M11.999 15.981V20L17 13.079 12 15.98Z"
        />
        <path fill="#fff" d="M11.999 20v-4.02l-5-2.901 5 6.921Z" />
        <path
          fill="#fff"
          fillOpacity=".18"
          d="m11.999 15.051 4.999-2.902-5-2.233v5.135Z"
        />
        <path
          fill="#fff"
          fillOpacity=".6"
          d="m6.999 12.149 5 2.902V9.916l-5 2.232Z"
        />
      </svg>
    ),
  ),
);

EthereumDarkIcon.displayName = "EthereumDarkIcon";
