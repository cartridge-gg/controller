import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const ArcadeIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          d="M15.8692 15.8536C15.8692 15.6673 15.8674 14.0134 15.8674 14.0305H17.724V15.8536H15.8692Z"
          fill="currentColor"
        />
        <path
          d="M8.59774 15.8536H6.74292C6.74292 15.6673 6.74109 14.0134 6.74109 14.0305H8.59774V15.8536Z"
          fill="currentColor"
        />
        <path
          d="M8.625 9.18763H15.8983V11.0107H8.62683C8.62683 10.8244 8.625 9.17048 8.625 9.18763Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.32014 4.5H19.2215C19.511 4.5 19.686 4.5 19.9171 4.73058L21.3105 6.10762C21.5417 6.33606 21.5417 6.56664 21.5417 6.79721V17.2028C21.5417 17.4334 21.5417 17.6639 21.3105 17.8924L19.9171 19.2694C19.686 19.5 19.511 19.5 19.2215 19.5H15.8622V17.6767H8.59715L8.59645 19.5H5.32014C5.03066 19.5 4.85568 19.5 4.62453 19.2694L3.23115 17.8924C3 17.6618 3 17.4334 3 17.2028V6.79721C3 6.56664 3 6.3382 3.23115 6.10762L4.62453 4.73058C4.85568 4.5 5.03066 4.5 5.32014 4.5ZM19.686 6.56664C19.686 6.56664 19.686 6.33606 19.4548 6.33606H5.08899C4.85784 6.33606 4.85784 6.56664 4.85784 6.56664V17.4334C4.85784 17.4334 4.85784 17.6639 5.08899 17.6639H8.59593C8.59611 17.5103 8.59774 16.0293 8.59774 15.8536H15.8692V17.6639H19.4548C19.686 17.6639 19.686 17.4334 19.686 17.4334V6.56664Z"
          fill="currentColor"
        />
      </svg>
    ),
  ),
);

ArcadeIcon.displayName = "ArcadeIcon";
