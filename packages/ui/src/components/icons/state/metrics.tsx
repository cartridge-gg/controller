import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const MetricsIcon = memo(
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
                  d="M12.033 11.498V4.49c0-.282.22-.52.501-.52a7.027 7.027 0 0 1 7.027 7.026.512.512 0 0 1-.52.502h-7.008ZM3.5 12.502a7.529 7.529 0 0 1 6.493-7.457.475.475 0 0 1 .534.484v7.475l4.91 4.91c.21.21.194.554-.048.724A7.529 7.529 0 0 1 3.5 12.502Zm16.513.502c.292 0 .52.245.483.533a7.502 7.502 0 0 1-2.318 4.464.477.477 0 0 1-.665-.022l-4.979-4.975h7.479Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M12.534 11.498a.503.503 0 0 1-.502-.502V4.455c0-.264.204-.484.468-.486h.034a7.027 7.027 0 0 1 7.027 7.027l-.028.034a.453.453 0 0 1-.458.468h-6.54Zm.502-6.504v5.5h5.5a6.022 6.022 0 0 0-5.5-5.5Zm-2.51.531v7.479l4.91 4.909c.21.21.195.555-.047.728A7.529 7.529 0 0 1 3.5 12.502c0-3.805 2.826-6.954 6.465-7.458a.485.485 0 0 1 .562.481Zm-.708 8.188a1.002 1.002 0 0 1-.295-.71V6.152a6.53 6.53 0 0 0-5.02 6.35 6.524 6.524 0 0 0 9.766 5.666l-4.451-4.454ZM18.178 18c-.188.15-.483.163-.665-.019L13.39 13.86a.502.502 0 0 1 .354-.856h6.268c.288 0 .52.244.483.533A7.52 7.52 0 0 1 18.178 18Zm1.207-3.994H14.96l2.896 2.896a6.633 6.633 0 0 0 1.53-2.895Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

MetricsIcon.displayName = "MetricsIcon";
