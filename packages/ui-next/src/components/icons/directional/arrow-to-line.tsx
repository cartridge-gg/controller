import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { DirectionalIconProps } from "../types";

export const ArrowToLineIcon = memo(
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
                  d="M6 4a.855.855 0 0 0-.857.857c0 .475.382.857.857.857h12a.855.855 0 0 0 .857-.857A.855.855 0 0 0 18 4H6Zm6.625 4.843a.854.854 0 0 0-1.25 0L6.804 13.7a.857.857 0 0 0 1.246 1.175l3.093-3.286v7.554c0 .475.382.857.857.857a.855.855 0 0 0 .857-.857v-7.554l3.09 3.282a.857.857 0 0 0 1.246-1.175L12.62 8.84l.004.004Z"
                />
              );
            case "right":
              return (
                <path
                  className="fill-current"
                  d="M20 6a.855.855 0 0 0-.857-.857.855.855 0 0 0-.857.857v12c0 .475.382.857.857.857A.855.855 0 0 0 20 18V6Zm-4.843 6.625a.855.855 0 0 0 0-1.25L10.3 6.804A.857.857 0 0 0 9.125 8.05l3.286 3.093H4.857A.855.855 0 0 0 4 12c0 .475.382.857.857.857h7.554l-3.282 3.09a.857.857 0 0 0 1.175 1.246l4.857-4.572-.004.004Z"
                />
              );
            case "down":
              return (
                <path
                  className="fill-current"
                  d="M18 20a.855.855 0 0 0 .857-.857.855.855 0 0 0-.857-.857H6a.855.855 0 0 0-.857.857c0 .475.382.857.857.857h12Zm-6.625-4.843a.855.855 0 0 0 1.25 0l4.571-4.857a.857.857 0 0 0-1.246-1.175l-3.093 3.286V4.857A.855.855 0 0 0 12 4a.855.855 0 0 0-.857.857v7.554l-3.09-3.282a.857.857 0 0 0-1.246 1.175l4.572 4.857-.004-.004Z"
                />
              );
            case "left":
              return (
                <path
                  className="fill-current"
                  d="M4 18c0 .475.382.857.857.857A.855.855 0 0 0 5.714 18V6a.855.855 0 0 0-.857-.857A.855.855 0 0 0 4 6v12Zm4.843-6.625a.854.854 0 0 0 0 1.25l4.857 4.571a.857.857 0 0 0 1.175-1.246l-3.286-3.093h7.554A.855.855 0 0 0 20 12a.855.855 0 0 0-.857-.857h-7.554l3.282-3.09a.857.857 0 0 0-1.175-1.246L8.84 11.38l.004-.004Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

ArrowToLineIcon.displayName = "ArrowToLineIcon";
