import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { DirectionalIconProps } from "../types";

export const WedgeIcon = memo(
  forwardRef<SVGSVGElement, DirectionalIconProps>(
    ({ className, size, variant, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        {(() => {
          switch (variant) {
            case "up":
              return (
                <path
                  className="fill-current"
                  d="M12 9.25c.176 0 .352.067.486.201l4.125 4.125a.687.687 0 1 1-.972.973L12 10.909l-3.64 3.639a.687.687 0 1 1-.971-.972l4.125-4.125c.134-.134.31-.201.486-.201Z"
                />
              );
            case "right":
              return (
                <path
                  className="fill-current"
                  d="M14.75 12a.685.685 0 0 1-.201.486l-4.125 4.125a.687.687 0 1 1-.973-.972L13.091 12 9.452 8.36a.687.687 0 1 1 .972-.971l4.125 4.125c.134.134.201.31.201.486Z"
                />
              );
            case "down":
              return (
                <path
                  className="fill-current"
                  d="M12 15.5a.747.747 0 0 1-.53-.22l-4.5-4.5a.75.75 0 1 1 1.06-1.06L12 13.69l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.748.748 0 0 1-.53.22Z"
                />
              );
            case "left":
              return (
                <path
                  className="fill-current"
                  d="M9.25 12c0-.176.067-.352.201-.486l4.125-4.125a.687.687 0 1 1 .973.972L10.909 12l3.639 3.64a.687.687 0 1 1-.972.971L9.45 12.486A.686.686 0 0 1 9.25 12Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

WedgeIcon.displayName = "WedgeIcon";
