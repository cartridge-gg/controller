import { forwardRef, memo } from "react";
import { duotoneIconVariants } from "../utils";
import { DuotoneIconProps } from "../types";

export const TrashDuoIcon = memo(
  forwardRef<SVGSVGElement, DuotoneIconProps>(
    ({ className, variant, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 30 30"
        className={duotoneIconVariants({ variant, size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          className="color fill-current"
          fillOpacity="0.32"
          d="M20.9976 22.4109L21.6811 11.8438C21.7184 11.2674 21.2609 10.7793 20.6832 10.7793H9.31675C8.73907 10.7793 8.28155 11.2674 8.31884 11.8438L9.00233 22.4109C9.05507 23.3038 9.79335 23.9999 10.6863 23.9999H19.3137C20.2066 23.9999 20.9484 23.3038 20.9976 22.4109Z"
        />
        <path
          className="accentColor fill-tertiary"
          d="M12.8836 6C12.4582 6 12.068 6.23906 11.8781 6.62227L11.625 7.125H8.25C7.62773 7.125 7.125 7.62773 7.125 8.25C7.125 8.87227 7.62773 9.375 8.25 9.375H21.75C22.3723 9.375 22.875 8.87227 22.875 8.25C22.875 7.62773 22.3723 7.125 21.75 7.125H18.375L18.1219 6.62227C17.932 6.23906 17.5418 6 17.1164 6H12.8836Z"
        />
      </svg>
    ),
  ),
);

TrashDuoIcon.displayName = "TrashDuoIcon";
