import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const LostInCairoIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M4.61548 4V4.41026H5.43599V4.82051H5.84625V5.23077H6.2565V15.8974H5.84625V16.3077H5.43599V16.7179H4.61548V17.1282H6.2565V17.5385H7.07702V17.9487H8.30779V18.359H9.53856V18.7692H10.3591V19.1795H11.1796V19.5897H12.8206V20H16.9232V19.5897H17.7437V19.1795H18.5642V18.7692H18.9745V18.359H19.3847V17.9487H18.9745V18.359H18.1539V18.7692H16.9232V19.1795H13.6411V18.7692H12.4104V18.359H11.1796V17.9487H10.3591V17.5385H9.53856V17.1282H9.1283V16.7179H8.71804V16.3077H8.30779V5.23077H8.71804V4.82051H9.1283V4.41026H9.94881V4H4.61548Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

LostInCairoIcon.displayName = "LostInCairoIcon";
