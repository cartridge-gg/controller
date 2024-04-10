import { forwardRef, memo } from "react";
import { duotoneIconVariants } from "../utils";
import { DuotoneIconProps } from "../types";

export const TransactionDuoIcon = memo(
  forwardRef<SVGSVGElement, DuotoneIconProps>(
    ({ className, variant, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 30 30"
        className={duotoneIconVariants({ variant, size, className })}
        ref={forwardedRef}
        {...props}
      >
        <g clipPath="url(#clip0_195_8161)">
          <path
            className="accentColor fill-tertiary"
            d="M21.4558 10.0442L25.3058 13.8942C25.7355 14.3239 25.7355 15.0183 25.3058 15.4479L21.4558 19.2979C21.0261 19.7276 20.3317 19.7276 19.902 19.2979C19.4723 18.8683 19.4723 18.1739 19.902 17.7442L22.9717 14.6711L19.902 11.5979C19.4723 11.1683 19.4723 10.4739 19.902 10.0442C20.3317 9.6145 21.0261 9.6145 21.4558 10.0442ZM9.35578 11.5979L6.28437 14.6711L9.35578 17.7442C9.78547 18.1739 9.78547 18.8683 9.35578 19.2979C8.92609 19.7276 8.23172 19.7276 7.80203 19.2979L3.95107 15.4479C3.52152 15.0183 3.52152 14.3239 3.95107 13.8942L7.80203 10.0442C8.23172 9.6145 8.92609 9.6145 9.35578 10.0442C9.78547 10.4739 9.78547 11.1683 9.35578 11.5979Z"
          />
          <path
            className="color fill-foreground"
            fillOpacity="0.32"
            d="M17.8877 7.27327L13.4877 22.6736C13.3192 23.258 12.7108 23.5949 12.1264 23.4299C11.542 23.2614 11.2052 22.653 11.3702 22.0686L15.7702 6.66896C15.9386 6.08479 16.547 5.74654 17.1314 5.91347C17.7158 6.08036 18.0527 6.68924 17.8877 7.27327Z"
          />
        </g>
        <defs>
          <clipPath id="clip0_195_8161">
            <rect
              className="color fill-foreground"
              width="22"
              height="17.6"
              transform="translate(3.62891 5.87109)"
            />
          </clipPath>
        </defs>
      </svg>
    ),
  ),
);

TransactionDuoIcon.displayName = "TransactionDuoIcon";
