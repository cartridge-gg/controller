import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const ScanQRIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fill="currentColor"
          d="M3.129 4.366c0-.478.388-.866.866-.866h3.028a.866.866 0 0 1 0 1.731H4.86v2.163a.866.866 0 0 1-1.731 0V4.366ZM16.049 4.316c0-.45.366-.816.816-.816h2.448c.45 0 .816.366.816.816v2.448a.816.816 0 0 1-1.632 0V5.132h-1.632a.816.816 0 0 1-.816-.816ZM5.033 17.236c0-.45-.426-.816-.952-.816s-.952.366-.952.816v2.448c0 .45.426.816.952.816h2.856c.525 0 .952-.366.952-.816 0-.45-.427-.816-.952-.816H5.033v-1.632ZM19.313 16.42c.45 0 .816.366.816.816v2.448c0 .45-.366.816-.816.816h-2.448a.816.816 0 0 1 0-1.632h1.632v-1.632c0-.45.365-.816.816-.816ZM8 8h2.667v2.667H8V8ZM10.667 10.667h2.667v2.666h-2.667v-2.666ZM13.333 8H16v2.667h-2.666V8ZM13.334 13.333H16V16h-2.667v-2.667ZM8 13.333h2.667V16H8v-2.667Z"
        />
      </svg>
    ),
  ),
);

ScanQRIcon.displayName = "ScanQRIcon";
