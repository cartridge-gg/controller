import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const TerminalIcon = memo(
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
                  d="M4.5 7.313c0-1.035.84-1.875 1.875-1.875h11.25c1.034 0 1.875.84 1.875 1.875v9.375c0 1.034-.84 1.875-1.875 1.875H6.375A1.877 1.877 0 0 1 4.5 16.688V7.313Zm2.997 1.634a.7.7 0 0 0 .044.993L9.788 12l-2.247 2.06a.704.704 0 0 0 .95 1.037l2.812-2.578a.699.699 0 0 0 0-1.038L8.49 8.903a.7.7 0 0 0-.993.044Zm4.269 5.397a.701.701 0 0 0-.704.703c0 .39.314.703.704.703h4.218c.39 0 .704-.313.704-.703a.701.701 0 0 0-.704-.703h-4.218Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M17.625 6.375c.519 0 .938.419.938.938v9.375a.936.936 0 0 1-.938.937H6.375a.936.936 0 0 1-.938-.938V7.313c0-.518.42-.937.938-.937h11.25Zm-11.25-.938c-1.034 0-1.875.841-1.875 1.875v9.375c0 1.035.84 1.875 1.875 1.875h11.25c1.034 0 1.875-.84 1.875-1.875V7.313c0-1.034-.84-1.875-1.875-1.875H6.375Zm1.052 3.446a.47.47 0 0 0 .05.662L10.342 12l-2.865 2.458a.469.469 0 1 0 .612.712l3.281-2.813a.462.462 0 0 0 0-.709L8.09 8.836a.47.47 0 0 0-.662.05v-.003Zm3.636 5.93a.47.47 0 0 0-.47.468c0 .258.212.469.47.469h5.156a.47.47 0 0 0 .468-.469.47.47 0 0 0-.468-.469h-5.157Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

TerminalIcon.displayName = "TerminalIcon";
