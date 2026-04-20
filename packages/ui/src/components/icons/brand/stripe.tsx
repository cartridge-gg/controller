import { forwardRef, memo } from "react";
import type { IconProps } from "../types";
import { iconVariants } from "../utils";

export const StripeIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.5787 15.0293C17.5787 18.1973 15.1147 20 11.4667 20C9.82966 19.9988 8.21039 19.6611 6.70933 19.008V14.816C8.18133 15.616 10.016 16.2133 11.4667 16.2133C12.448 16.2133 13.0987 15.9573 13.0987 15.1467C13.0987 13.0347 6.42133 13.824 6.42133 8.96C6.42133 5.856 8.85333 4 12.416 4C13.8667 4 15.3173 4.21333 16.7787 4.8V8.93867C15.4282 8.22793 13.931 7.84085 12.4053 7.808C11.488 7.808 10.8693 8.07467 10.8693 8.768C10.8693 10.7413 17.5787 9.80267 17.5787 15.04V15.0293Z"
          fill="white"
        />
      </svg>
    ),
  ),
);

StripeIcon.displayName = "StripeIcon";
