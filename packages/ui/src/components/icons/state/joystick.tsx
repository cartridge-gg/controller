import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const JoystickIcon = memo(
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
                  d="M15.5 7.5a3.503 3.503 0 0 1-2.5 3.356V14h-2v-3.144A3.5 3.5 0 1 1 15.5 7.5ZM11.25 7c.416 0 .75-.334.75-.75a.748.748 0 0 0-.75-.75.748.748 0 0 0-.75.75c0 .416.334.75.75.75ZM7 15a.999.999 0 1 1 2 0h8c1.103 0 2 .897 2 2v1c0 1.103-.897 2-2 2H7c-1.103 0-2-.897-2-2v-1c0-1.103.897-2 2-2Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M17.51 14.991H12.5v-4.057a3.497 3.497 0 0 0 3.006-3.456C15.507 5.541 13.937 4 12 4c-1.936 0-3.534 1.541-3.534 3.45a3.496 3.496 0 0 0 3.005 3.456v4.085H6.463c-.802 0-1.475.673-1.475 1.503v2.003c0 .83.673 1.503 1.502 1.503h11.02c.83 0 1.502-.673 1.502-1.503v-2.003c0-.83-.673-1.503-1.502-1.503ZM9.496 7.478A2.508 2.508 0 0 1 12 4.974a2.507 2.507 0 0 1 2.505 2.504A2.507 2.507 0 0 1 12 9.982a2.508 2.508 0 0 1-2.504-2.504Zm8.515 11.02c0 .275-.225.5-.501.5H6.49a.502.502 0 0 1-.5-.5v-2.004c0-.276.224-.501.5-.501h11.02c.276 0 .5.225.5.5v2.004ZM12.25 6.475a.751.751 0 1 0-1.503 0 .751.751 0 0 0 1.503 0ZM6.99 13.99h2.004a.5.5 0 1 0 0-1.001H6.99a.502.502 0 0 0 0 1.001Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

JoystickIcon.displayName = "JoystickIcon";
