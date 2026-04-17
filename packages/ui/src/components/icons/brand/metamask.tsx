import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const MetaMaskIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.81532 10.9146L4.50217 11.1405L5.22354 11.9827L4.12638 15.3838L5.14861 18.8587L8.70628 17.8789L9.39634 18.4437L10.791 19.4167H13.1967L14.6059 18.4426L15.2937 17.8789L18.8525 18.8575L19.8747 15.3871L18.7697 11.9871L19.4978 11.1405L19.1847 10.9146L19.6857 10.456L19.2976 10.1552L19.7998 9.77156L19.4665 9.52104L20 6.96211L19.2026 4.58325L14.1172 6.48567H9.8862L4.79072 4.58325L4 6.961L4.5346 9.51992L4.1946 9.77268L4.69677 10.1541L4.31427 10.456L4.81532 10.9146ZM10.0487 12.8201L11.186 15.2017L7.31709 14.0644L10.0487 12.8201ZM13.9391 12.814L12.797 15.2047L16.6686 14.0722L13.9391 12.814Z"
          className="fill-current"
        />
      </svg>
    ),
  ),
);

MetaMaskIcon.displayName = "MetaMaskIcon";
