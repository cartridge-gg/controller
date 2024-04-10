import { forwardRef, memo } from "react";
import { duotoneIconVariants } from "../utils";
import { DuotoneIconProps } from "../types";

export const TransferDuoIcon = memo(
  forwardRef<SVGSVGElement, DuotoneIconProps>(
    ({ className, variant, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 30 30"
        className={duotoneIconVariants({ variant, size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          className="color fill-foreground"
          fillOpacity="0.32"
          d="M25.9988 20.461C25.9988 21.2601 25.3844 21.8745 24.624 21.8745H10.8795L10.8752 24.968C10.8752 25.3782 10.6324 25.7495 10.2561 25.9132C9.87999 26.077 9.44278 26.0025 9.14202 25.7239L4.32997 21.2556C3.89001 20.8474 3.89001 20.1518 4.32997 19.7437L9.14202 15.2753C9.44243 14.9967 9.87973 14.9222 10.2561 15.086C10.6324 15.2498 10.8752 15.6209 10.8752 16.0312L10.8795 19.1248H24.624C25.3844 19.1248 25.9988 19.7392 25.9988 20.461Z"
        />
        <path
          className="accentColor fill-tertiary"
          d="M25.6681 8.74449L20.8561 4.27616C20.5556 3.99757 20.1184 3.92311 19.742 4.08677C19.3657 4.25072 19.1229 4.62211 19.1229 5.03199L19.1203 8.1258H5.37585C4.6158 8.1258 4.00098 8.7402 4.00098 9.462C4.00098 10.1838 4.6158 10.8755 5.37585 10.8755H19.1203L19.1237 13.969C19.1237 14.3792 19.3665 14.7505 19.7428 14.9142C20.1189 15.078 20.5561 15.0035 20.8569 14.7249L25.6689 10.2566C26.1106 9.84869 26.1106 9.15266 25.6681 8.74449Z"
        />
      </svg>
    ),
  ),
);

TransferDuoIcon.displayName = "TransferDuoIcon";
