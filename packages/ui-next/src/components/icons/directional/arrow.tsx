import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { DirectionalIconProps } from "../types";

export const ArrowIcon = memo(
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
                  d="M12 20a.862.862 0 0 1-.864-.86V7.003l-4.553 4.75a.865.865 0 0 1-1.22.028.857.857 0 0 1-.03-1.214l6.042-6.299a.87.87 0 0 1 1.25-.001l6.043 6.299a.859.859 0 0 1-.031 1.215.865.865 0 0 1-1.22-.03l-4.554-4.748v12.17c0 .474-.389.828-.863.828Z"
                />
              );
            case "right":
              return (
                <path
                  className="fill-current"
                  d="m13.45 5.38 6.284 6a.858.858 0 0 1 0 1.24l-6.285 6a.858.858 0 0 1-1.183-1.24l4.74-4.522H4.856a.858.858 0 0 1 0-1.714h12.146l-4.74-4.521a.86.86 0 0 1-.028-1.214c.329-.343.84-.355 1.214-.03Z"
                />
              );
            case "down":
              return (
                <path
                  className="fill-current"
                  d="M12 4c.477 0 .864.385.864.86v12.138l4.553-4.75a.865.865 0 0 1 1.22-.028.857.857 0 0 1 .03 1.214l-6.042 6.299a.87.87 0 0 1-1.25 0l-6.043-6.298a.859.859 0 0 1 .03-1.215.865.865 0 0 1 1.221.03l4.554 4.748V4.828c0-.474.388-.828.863-.828Z"
                />
              );
            case "left":
              return (
                <path
                  className="fill-current"
                  d="M20 12a.858.858 0 0 1-.86.855H7.003l4.75 4.508a.85.85 0 0 1 .028 1.209.863.863 0 0 1-1.214.029l-6.299-5.982A.843.843 0 0 1 4 12c0-.235.096-.456.266-.62l6.299-5.982a.865.865 0 0 1 1.215.03.85.85 0 0 1-.03 1.21l-4.748 4.507h12.17c.474 0 .828.385.828.855Z"
                />
              );
          }
        })()}
      </svg>
    ),
  ),
);

ArrowIcon.displayName = "ArrowIcon";
