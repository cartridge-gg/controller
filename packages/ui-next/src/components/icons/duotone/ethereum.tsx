import { forwardRef, memo } from "react";
import { duotoneIconVariants } from "../utils";
import { DuotoneIconProps } from "../types";

export const EthereumDuoIcon = memo(
  forwardRef<SVGSVGElement, DuotoneIconProps>(
    ({ className, variant, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 30 30"
        className={duotoneIconVariants({ variant, size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          className="accentColor fill-tertiary"
          d="M14.9973 3.99976V12.1323L21.871 15.2038L14.9973 3.99976Z"
        />
        <path
          className="accentColor fill-tertiary"
          d="M14.9986 3.99976L8.12402 15.2038L14.9986 12.1323V3.99976Z"
        />
        <path
          className="color fill-foreground"
          fillOpacity="0.32"
          d="M14.9973 20.4742V26.0001L21.8756 16.484L14.9973 20.4742Z"
        />
        <path
          className="accentColor fill-tertiary"
          d="M14.9986 26.0001V20.4733L8.12402 16.484L14.9986 26.0001Z"
        />
        <path
          className="color fill-foreground"
          fillOpacity="0.32"
          d="M14.9973 19.1952L21.871 15.2042L14.9973 12.1345V19.1952Z"
        />
        <path
          className="accentColor fill-tertiary"
          d="M8.12402 15.2042L14.9986 19.1952V12.1345L8.12402 15.2042Z"
        />
      </svg>
    ),
  ),
);

EthereumDuoIcon.displayName = "EthereumDuoIcon";
