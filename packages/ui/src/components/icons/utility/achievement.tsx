import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const AchievementIcon = memo(
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
          d="m18 5 2.305 1.519 2.758-.164 1.239 2.468 2.468 1.24-.164 2.757 1.519 2.305-1.519 2.305.164 2.758-2.468 1.239-1.24 2.468-2.758-.164L18 25.25l-2.305-1.519-2.758.164-1.239-2.468-2.468-1.24.164-2.758-1.519-2.304 1.519-2.305-.164-2.758 2.468-1.239 1.24-2.468 2.757.164L18 5Zm4.219 10.125A4.218 4.218 0 0 0 18 10.906a4.218 4.218 0 0 0-4.219 4.219A4.218 4.218 0 0 0 18 19.344a4.218 4.218 0 0 0 4.219-4.219ZM7.875 29.047l2.626-6.244.928 1.846.496.991 1.107-.063 2.2-.127 1.682 1.108L14.625 32l-2.753-2.953H7.875ZM21.375 32l-2.294-5.442 1.682-1.108 2.2.127 1.107.063.495-.991.929-1.846 2.631 6.244h-3.997L21.375 32Z"
        />
      </svg>
    ),
  ),
);

AchievementIcon.displayName = "AchievementIcon";
