import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const ArgentIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M14.0538 4.68555H9.93206C9.79164 4.68555 9.68427 4.80119 9.68427 4.94161C9.60167 8.93115 7.57798 12.7225 4.10055 15.4069C3.99317 15.4895 3.96839 15.6547 4.04273 15.7704L6.45463 19.2065C6.53723 19.3221 6.69417 19.3469 6.80981 19.2643C8.99043 17.5958 10.7415 15.5887 11.997 13.3585C13.2608 15.5887 15.0119 17.5958 17.1843 19.2643C17.2999 19.3469 17.4569 19.3221 17.5395 19.2065L19.9514 15.7704C20.034 15.6547 20.0092 15.4978 19.8935 15.4069C16.4079 12.7225 14.3924 8.93941 14.3098 4.94161C14.3016 4.80119 14.1859 4.68555 14.0538 4.68555Z"
          className="fill-current"
        />
      </svg>
    ),
  ),
);

ArgentIcon.displayName = "ArgentIcon";
