import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const OpenZeppelinIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M4.9735 4H19.0474L16.6426 8.06041H4.9735V4Z"
          fill="currentColor"
        />
        <path
          d="M4.95129 19.9997C5.41539 19.2221 5.86184 18.479 6.30195 17.7464C7.60132 15.5835 8.84544 13.5126 10.3253 10.9176C11.025 9.74535 12.2342 9.01693 13.7269 9.01693H16.0724L9.52236 19.9997H4.95129Z"
          fill="currentColor"
        />
        <path
          d="M14.5933 16.0019C13.4017 16.0019 12.551 16.5648 12.0218 17.4709C11.5804 18.2264 11.1743 18.9005 10.7277 19.6416C10.6569 19.7592 10.585 19.8784 10.5119 20H19.0487V15.9901L14.5933 16.0019Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

OpenZeppelinIcon.displayName = "OpenZeppelinIcon";
