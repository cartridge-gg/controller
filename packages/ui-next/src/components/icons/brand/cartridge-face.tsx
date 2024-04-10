import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const CartridgeFaceIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          className="fill-current"
          d="M4.562 6.316c-.219.22-.219.441-.219.66h.002v2.176H6.1V6.755c0-.22.218-.22.218-.22h11.398s.218 0 .218.22v2.397h1.74v3.445H21.5V9.152h-1.814V6.976c0-.219 0-.44-.218-.66l-1.315-1.32c-.219-.219-.44-.219-.658-.219H6.535c-.219 0-.44 0-.658.22l-1.315 1.32Z"
        />
        <path
          className="fill-current"
          d="M19.686 12.597h-1.752v2.832c0 .22-.218.22-.218.22h-2.414v1.74H8.71v-1.74H6.316l.002-.003s-.218 0-.218-.219v-2.83H4.345v2.61c0 .22 0 .442.219.66l1.315 1.32c.219.22.44.22.658.22H8.71v1.816h6.59v-1.816h2.194c.218 0 .44 0 .658-.22l1.315-1.32c.218-.218.218-.44.218-.66v-2.61ZM2.5 9.152v3.445h1.826V9.152H2.5ZM9.09 11.246h1.042a.344.344 0 0 0 .344-.344v-1.45a.344.344 0 0 0-.344-.345H9.091a.343.343 0 0 0-.344.345v1.452c0 .191.155.342.344.342ZM13.919 11.246h1.041c.191 0 .344-.155.344-.344v-1.45a.344.344 0 0 0-.344-.345H13.92a.343.343 0 0 0-.344.345v1.452c0 .191.155.342.344.342Z"
        />
      </svg>
    ),
  ),
);

CartridgeFaceIcon.displayName = "CartridgeFaceIcon";
