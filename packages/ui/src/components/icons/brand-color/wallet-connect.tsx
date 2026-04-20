import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const WalletConnectColorIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fill="#3B99FC"
          d="M6.686 8.155c2.935-2.873 7.693-2.873 10.628 0l.352.344a.359.359 0 0 1 0 .52l-1.207 1.184a.194.194 0 0 1-.264 0l-.488-.478c-2.047-2.006-5.367-2.006-7.414 0l-.52.51a.194.194 0 0 1-.265 0L6.296 9.056a.359.359 0 0 1 0-.52l.39-.38Zm13.125 2.447 1.078 1.054a.36.36 0 0 1 0 .52l-4.852 4.75a.378.378 0 0 1-.53 0l-3.44-3.371a.095.095 0 0 0-.134 0l-3.44 3.37a.378.378 0 0 1-.53 0l-4.852-4.749a.359.359 0 0 1 0-.52l1.078-1.054a.378.378 0 0 1 .529 0l3.44 3.37a.095.095 0 0 0 .135 0l3.44-3.37a.378.378 0 0 1 .53 0l3.44 3.37a.095.095 0 0 0 .134 0l3.44-3.37a.384.384 0 0 1 .534 0Z"
        />
      </svg>
    ),
  ),
);

WalletConnectColorIcon.displayName = "WalletConnectColorIcon";
