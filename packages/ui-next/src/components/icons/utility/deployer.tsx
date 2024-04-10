import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const DeployerIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fill="currentColor"
          d="M17.5 4c.416 0 .75.334.75.75v1h1c.416 0 .75.334.75.75s-.334.75-.75.75h-1v1c0 .416-.334.75-.75.75a.748.748 0 0 1-.75-.75v-1h-1A.748.748 0 0 1 15 6.5c0-.416.334-.75.75-.75h1v-1c0-.416.334-.75.75-.75ZM12.734 8.163a1.748 1.748 0 0 0-1.469 0l-6.831 3.156a.75.75 0 0 0 0 1.363l6.831 3.156a1.749 1.749 0 0 0 1.47 0l6.83-3.156A.747.747 0 0 0 20 12a.747.747 0 0 0-.434-.68l-6.832-3.157Z"
        />
        <path
          fill="currentColor"
          d="m19.566 15.32-1.663-.77-4.75 2.194a2.753 2.753 0 0 1-2.306 0l-4.75-2.194-1.663.77a.75.75 0 0 0 0 1.362l6.831 3.156a1.749 1.749 0 0 0 1.47 0l6.83-3.156A.747.747 0 0 0 20 16a.747.747 0 0 0-.434-.682Z"
        />
      </svg>
    ),
  ),
);

DeployerIcon.displayName = "DeployerIcon";
