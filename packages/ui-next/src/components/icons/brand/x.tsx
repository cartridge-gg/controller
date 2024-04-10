import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const XIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M13.4894 10.7749L19.3177 4H17.9366L12.8759 9.88256L8.83395 4H4.17202L10.2843 12.8955L4.17202 20H5.55321L10.8974 13.7878L15.1661 20H19.828L13.4891 10.7749H13.4894ZM11.5977 12.9738L10.9784 12.0881L6.05088 5.03974H8.17231L12.1489 10.728L12.7682 11.6137L17.9373 19.0075H15.8158L11.5977 12.9742V12.9738Z"
          className="fill-current"
        />
      </svg>
    ),
  ),
);

XIcon.displayName = "XIcon";
