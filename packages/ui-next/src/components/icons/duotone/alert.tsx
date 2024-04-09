import { forwardRef, memo } from "react";
import { duotoneIconVariants } from "../utils";
import { DuotoneIconProps } from "../types";

export const AlertDuoIcon = memo(
  forwardRef<SVGSVGElement, DuotoneIconProps>(
    ({ className, variant, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 30 30"
        className={duotoneIconVariants({ variant, size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fill="currentColor"
          className="accentColor"
          d="M16.125 10.125C16.125 9.502 15.623 9 15 9s-1.125.502-1.125 1.125v5.25c0 .623.502 1.125 1.125 1.125s1.125-.502 1.125-1.125v-5.25zM15 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
        />
        <path
          fill="currentColor"
          className="color"
          fillOpacity="0.32"
          fillRule="evenodd"
          d="M13.673 3.548a1.879 1.879 0 012.654 0l10.125 10.125a1.879 1.879 0 010 2.654L16.327 26.452a1.879 1.879 0 01-2.654 0L3.548 16.327a1.879 1.879 0 010-2.654L13.673 3.548zM15 8c-1.176 0-2.125.95-2.125 2.125v5.25c0 .796.436 1.489 1.082 1.853a2.501 2.501 0 102.086 0 2.122 2.122 0 001.082-1.853v-5.25C17.125 8.949 16.175 8 15 8z"
          clipRule="evenodd"
        />
      </svg>
    ),
  ),
);

AlertDuoIcon.displayName = "AlertDuoIcon";
