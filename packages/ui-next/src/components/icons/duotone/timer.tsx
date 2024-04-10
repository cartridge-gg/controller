import { forwardRef, memo } from "react";
import { duotoneIconVariants } from "../utils";
import { DuotoneIconProps } from "../types";

export const TimerDuoIcon = memo(
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
          d="M13.75 6.25C13.75 5.55977 14.3086 5 15 5C20.5234 5 25 9.47656 25 15C25 20.5234 20.5234 25 15 25C9.47656 25 5 20.5234 5 15C5 12.2031 6.15078 9.67188 8.00156 7.85703C8.49453 7.37422 9.28516 7.38203 9.76953 7.875C10.2539 8.36836 10.2461 9.16016 9.75 9.64453C8.36055 11.0039 7.5 12.9023 7.5 15C7.5 19.1406 10.8242 22.5 15 22.5C19.1406 22.5 22.5 19.1406 22.5 15C22.5 11.2852 19.7969 8.19883 16.25 7.60352V8.75C16.25 9.44141 15.6914 10 15 10C14.3086 10 13.75 9.44141 13.75 8.75V6.25Z"
        />
        <path
          className="accentColor fill-tertiary"
          d="M11.2109 11.2109C11.5781 10.8477 12.1719 10.8477 12.5039 11.2109L15.6289 14.3359C16.0273 14.7031 16.0273 15.2969 15.6289 15.6289C15.2969 16.0273 14.7031 16.0273 14.3359 15.6289L11.2109 12.5039C10.8477 12.1719 10.8477 11.5781 11.2109 11.2109Z"
        />
      </svg>
    ),
  ),
);

TimerDuoIcon.displayName = "TimerDuoIcon";
