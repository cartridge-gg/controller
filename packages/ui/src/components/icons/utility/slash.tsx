import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";
import { cn } from "@/utils";

export const SlashIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 15 15"
        className={cn("p-1", iconVariants({ size, className }))}
        ref={forwardedRef}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.10876 14L9.46582 1H10.8178L5.46074 14H4.10876Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

SlashIcon.displayName = "SlashIcon";
