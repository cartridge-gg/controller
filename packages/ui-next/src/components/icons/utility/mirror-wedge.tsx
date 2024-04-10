import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const MirrorWedgeIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <g clipPath="url(#clip0_1619_4027)">
          <path
            d="M11.9997 18.2856C11.8535 18.2856 11.7072 18.2298 11.5958 18.1182L8.1674 14.6898C7.9442 14.4666 7.9442 14.105 8.1674 13.8818C8.39061 13.6586 8.7522 13.6586 8.9754 13.8818L11.9997 16.9071L15.0246 13.8823C15.2478 13.6591 15.6094 13.6591 15.8326 13.8823C16.0558 14.1055 16.0558 14.4671 15.8326 14.6903L12.4042 18.1187C12.2926 18.2303 12.1462 18.2856 11.9997 18.2856Z"
            fill="currentColor"
          />
          <path
            d="M11.9997 5.71436C11.8535 5.71436 11.7072 5.77016 11.5958 5.88176L8.1674 9.31018C7.9442 9.53338 7.9442 9.89497 8.1674 10.1182C8.39061 10.3414 8.7522 10.3414 8.9754 10.1182L11.9997 7.09287L15.0246 10.1177C15.2478 10.3409 15.6094 10.3409 15.8326 10.1177C16.0558 9.89453 16.0558 9.53294 15.8326 9.30973L12.4042 5.88131C12.2926 5.76971 12.1462 5.71436 11.9997 5.71436Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <clipPath id="clip0_1619_4027">
            <rect width="24" height="24" />
          </clipPath>
        </defs>
      </svg>
    ),
  ),
);

MirrorWedgeIcon.displayName = "MirrorWedgeIcon";
