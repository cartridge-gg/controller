import { forwardRef, memo } from "react";
import { duotoneIconVariants } from "../utils";
import { DuotoneIconProps } from "../types";

export const LogoutDuoIcon = memo(
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
          d="M25.0495 15.9466L26.0002 15.0001L25.0537 14.0536L19.693 8.69288L18.7423 7.74219L16.8451 9.63939L17.7916 10.5859L20.8657 13.6599H12.0414H10.7012V16.3403H12.0414H20.8657L17.7916 19.4144L16.8451 20.3609L18.7423 22.2581L19.6888 21.3116L25.0495 15.9508V15.9466Z"
        />
        <path
          className="color fill-foreground"
          fillOpacity="0.32"
          d="M10.7009 8.29903H12.0411V5.61865H10.7009H5.34019H4V6.95884V23.0411V24.3813H5.34019H10.7009H12.0411V21.7009H10.7009H6.68037V8.29903H10.7009Z"
        />
      </svg>
    ),
  ),
);

LogoutDuoIcon.displayName = "LogoutDuoIcon";
