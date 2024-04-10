import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const WalletIcon = memo(
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
                  d="M6 5c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7c0-1.103-.897-2-2-2H6.5a.501.501 0 0 1-.5-.5c0-.275.225-.5.5-.5H18a.999.999 0 1 0 0-2H6Zm11 7.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M18.5 5a.5.5 0 0 1 0 1h-12A1.5 1.5 0 0 0 5 7.5v9A1.5 1.5 0 0 0 6.5 18h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 17.5 8h-10a.501.501 0 0 1-.5-.5c0-.275.225-.5.5-.5h10A2.5 2.5 0 0 1 20 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9A2.5 2.5 0 0 1 6.5 5h12Zm-3.25 8c0-.416.334-.75.75-.75s.75.334.75.75-.334.75-.75.75a.748.748 0 0 1-.75-.75Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

WalletIcon.displayName = "WalletIcon";
