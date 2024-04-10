import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const CodeIcon = memo(
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
                  className="fill-current"
                  d="M4 7c0-1.103.897-2 2-2h12c1.103 0 2 .897 2 2v10c0 1.103-.897 2-2 2H6c-1.103 0-2-.897-2-2V7Zm9.194 2.247a.748.748 0 0 0 .056 1.06L15.128 12l-1.881 1.694a.748.748 0 0 0-.056 1.06c.278.309.75.334 1.059.055l2.5-2.25a.75.75 0 0 0 0-1.113l-2.5-2.25a.748.748 0 0 0-1.06.057l.004-.006Zm-2.44 1.06a.748.748 0 0 0 .055-1.06.748.748 0 0 0-1.059-.056l-2.5 2.25a.75.75 0 0 0 0 1.113l2.5 2.25a.748.748 0 0 0 1.06-.057.748.748 0 0 0-.057-1.06L8.872 12l1.881-1.694Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="m13.847 9.419 2 2.25a.45.45 0 0 1 0 .662l-2 2.25a.447.447 0 0 1-.678.016.47.47 0 0 1-.044-.678l1.706-1.947-1.706-1.89a.503.503 0 0 1 .044-.707.47.47 0 0 1 .678.044ZM9.169 12l1.678 1.919c.21.178.19.522-.016.678a.478.478 0 0 1-.706-.016l-2-2.25a.504.504 0 0 1 0-.662l2-2.25a.503.503 0 0 1 .706-.044c.207.184.225.5.016.706L9.169 12ZM18 5a2 2 0 0 1 2 2v10c0 1.103-.897 2-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12Zm0 1H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12c.553 0 1-.447 1-1V7a1 1 0 0 0-1-1Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

CodeIcon.displayName = "CodeIcon";
