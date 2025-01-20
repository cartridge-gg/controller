import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const CheckboxCheckedIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          className="color fill-current"
          d="M6.28571 5.14286C5.65357 5.14286 5.14286 5.65357 5.14286 6.28571V17.7143C5.14286 18.3464 5.65357 18.8571 6.28571 18.8571H17.7143C18.3464 18.8571 18.8571 18.3464 18.8571 17.7143V6.28571C18.8571 5.65357 18.3464 5.14286 17.7143 5.14286H6.28571ZM4 6.28571C4 5.025 5.025 4 6.28571 4H17.7143C18.975 4 20 5.025 20 6.28571V17.7143C20 18.975 18.975 20 17.7143 20H6.28571C5.025 20 4 18.975 4 17.7143V6.28571Z"
        />
        <path
          className="fill-primary"
          d="M11.2607 14.6893L15.8322 10.1179C16.0536 9.89644 16.0536 9.53215 15.8322 9.31072C15.6107 9.0893 15.2464 9.0893 15.025 9.31072L10.8572 13.4786L8.97502 11.5964C8.75359 11.375 8.3893 11.375 8.16787 11.5964C7.94644 11.8179 7.94644 12.1822 8.16787 12.4036L10.4536 14.6893C10.675 14.9107 11.0393 14.9107 11.2607 14.6893Z"
        />
      </svg>
    ),
  ),
);

CheckboxCheckedIcon.displayName = "CheckboxCheckedIcon";
