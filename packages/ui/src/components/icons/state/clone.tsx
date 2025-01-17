import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { StateIconProps } from "../types";

export const CloneIcon = memo(
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
                  d="M4 18c0 1.103.897 2 2 2h7c1.103 0 2-.897 2-2v-2h-4a3 3 0 0 1-3-3V9H6c-1.103 0-2 .897-2 2v7Zm7-3h7c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-7c-1.103 0-2 .897-2 2v7c0 1.103.897 2 2 2Z"
                />
              );
            case "line":
              return (
                <path
                  className="fill-current"
                  d="M6 19h7c.553 0 1-.447 1-1v-1.5c0-.275.225-.5.5-.5s.5.225.5.5V18c0 1.103-.897 2-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1.5c.275 0 .5.225.5.5s-.225.5-.5.5H6a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1ZM9 6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7c0 1.103-.897 2-2 2h-7c-1.103 0-2-.897-2-2V6Zm2 8h7c.553 0 1-.447 1-1V6a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v7c0 .553.447 1 1 1Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

CloneIcon.displayName = "CloneIcon";
