import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const ShieldIcon = memo(
  forwardRef<SVGSVGElement, StateIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        {(() => {
          switch (variant) {
            case "solid":
              return (
                <path
                  d="M12 4C12.1437 4 12.2875 4.03125 12.4187 4.09063L18.3031 6.5875C18.9906 6.87813 19.5031 7.55625 19.5 8.375C19.4844 11.475 18.2094 17.1469 12.825 19.725C12.3031 19.975 11.6969 19.975 11.175 19.725C5.79062 17.1469 4.51562 11.475 4.5 8.375C4.49687 7.55625 5.00937 6.87813 5.69687 6.5875L11.5844 4.09063C11.7125 4.03125 11.8562 4 12 4Z"
                  className="fill-current"
                />
              );
            case "line":
              return (
                <path
                  d="M12 5.54375L6.28125 7.96875C6.09687 8.04688 5.99687 8.2125 6 8.36875C6.01562 11.225 7.2 16.1594 11.825 18.3719C11.9375 18.425 12.0688 18.425 12.1781 18.3719C16.8031 16.1562 17.9875 11.225 18 8.36562C18 8.20937 17.9031 8.04688 17.7188 7.96563L12 5.54375ZM12.4187 4.09063L18.3031 6.5875C18.9906 6.87813 19.5031 7.55625 19.5 8.375C19.4844 11.475 18.2094 17.1469 12.825 19.725C12.3031 19.975 11.6969 19.975 11.175 19.725C5.79063 17.1469 4.51562 11.475 4.5 8.375C4.49687 7.55625 5.00937 6.87813 5.69687 6.5875L11.5844 4.09063C11.7125 4.03125 11.8562 4 12 4C12.1438 4 12.2875 4.03125 12.4187 4.09063Z"
                  className="fill-current"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

ShieldIcon.displayName = "ShieldIcon";
