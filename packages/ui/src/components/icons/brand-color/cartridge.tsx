import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const CartridgeColorIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path fill="#FBCB4A" d="M8.459 10.45h7.008V8.68H8.461l-.002 1.77Z" />
        <path
          fill="#FBCB4A"
          d="m20.323 6.804-4.282-1.808a2.24 2.24 0 0 0-.902-.225H8.861c-.314.011-.62.088-.902.225L3.677 6.804A1.24 1.24 0 0 0 3 7.934v7.23c0 .226 0 .452.226.678l1.352 1.355c.226.226.395.226.676.226h3.098v1.806h7.322v-1.808H8.358v-1.805H5.029c-.225 0-.225-.226-.225-.226V6.804s0-.226.225-.226h13.943c.225 0 .225.226.225.226v8.586s0 .226-.225.226h-3.296v1.807h3.07c.282 0 .451 0 .676-.226l1.352-1.355c.226-.226.226-.452.226-.678v-7.23a1.245 1.245 0 0 0-.677-1.13Z"
        />
      </svg>
    ),
  ),
);

CartridgeColorIcon.displayName = "CartridgeColorIcon";
