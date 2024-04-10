import { forwardRef, memo } from "react";
import { duotoneIconVariants } from "../utils";
import { DuotoneIconProps } from "../types";

export const PlugActiveDuoIcon = memo(
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
          d="M6.66667 5.66634V9.66634H9.33333V5.66634C9.33333 4.93009 8.7375 4.33301 8 4.33301C7.26375 4.33301 6.66667 4.93009 6.66667 5.66634Z"
        />
        <path
          className="color fill-current"
          fillOpacity="0.32"
          d="M14.6667 5.66634V9.66634H17.3333V5.66634C17.3333 4.93009 16.7375 4.33301 16 4.33301C15.2625 4.33301 14.6667 4.93009 14.6667 5.66634Z"
        />
        <path
          className="color fill-current"
          fillOpacity="0.32"
          d="M5.33333 10.9997C4.59708 10.9997 4 11.5955 4 12.333C4 13.0705 4.59708 13.6663 5.33333 13.6663V14.9997C5.33333 18.2247 7.62375 20.8788 10.6667 21.533V25.6663H13.3333V21.533C13.8458 21.4288 14.3375 21.2663 14.7958 21.0538C14.7125 20.6038 14.6667 20.1413 14.6667 19.6663C14.6667 16.3205 16.9083 13.4622 19.9708 12.6163C19.9875 12.5247 20 12.4288 20 12.333C20 11.5955 19.4042 10.9997 18.6667 10.9997H5.33333Z"
        />
        <path
          className="accentColor fill-tertiary"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22 25.6665C25.3125 25.6665 28 22.979 28 19.6665C28 16.354 25.3125 13.6665 22 13.6665C18.6875 13.6665 16 16.354 16 19.6665C16 22.979 18.6875 25.6665 22 25.6665ZM19.9362 19.0804L24.9565 16.0685L22.4466 19.0804L24.1199 20.0849L19.0996 23.0968L21.6095 20.0849L19.9362 19.0804Z"
        />
      </svg>
    ),
  ),
);

PlugActiveDuoIcon.displayName = "PlugActiveDuoIcon";
