import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const SlotIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M15.3975 4.03401L19.932 8.5685L18.4001 10.1004L13.8656 5.56595L15.3975 4.03401Z"
          className="fill-current"
        />
        <path
          d="M13.8656 5.56595L12.7328 4.43339C12.5361 4.23413 12.2904 4.00099 11.8979 4L9.62366 4.1048C9.23118 4.10381 9.01489 4.28654 8.81916 4.48481L7.73798 5.56599L18.4001 16.2281L19.4813 15.1469C19.677 14.9487 19.8727 14.7504 19.8717 14.3529L19.8656 11.9677C19.8646 11.5702 19.6679 11.3709 19.4711 11.1717L18.4001 10.1004L16.8682 11.6324L12.3337 7.09787L13.8656 5.56595Z"
          className="fill-current"
        />
        <path
          d="M8.53449 19.966L4 15.4315L5.53203 13.8995L4.4609 12.8283C4.26415 12.6291 4.0674 12.4298 4.06638 12.0323L4.06028 9.64714C4.05927 9.24961 4.255 9.05134 4.45074 8.85308L5.53192 7.77189L16.194 18.434L15.1129 19.5152C14.9171 19.7135 14.7008 19.8962 14.3083 19.8952L12.0341 20C11.6416 19.999 11.3959 19.7659 11.1992 19.5666L10.0665 18.434L11.5983 16.9022L7.06385 12.3677L5.53203 13.8995L10.0665 18.434L8.53449 19.966Z"
          className="fill-current"
        />
      </svg>
    ),
  ),
);

SlotIcon.displayName = "SlotIcon";
