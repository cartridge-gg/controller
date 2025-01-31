import { forwardRef, memo } from "react";
import { iconVariants } from "../utils";
import { IconProps } from "../types";

export const ChestIcon = memo(
  forwardRef<SVGSVGElement, IconProps>(
    ({ className, size, ...props }, forwardedRef) => (
      <svg
        viewBox="0 0 24 24"
        className={iconVariants({ size, className })}
        ref={forwardedRef}
        {...props}
      >
        <path
          fill="currentColor"
          d="M4 9.333V12h3.556V5.778A3.555 3.555 0 0 0 4 9.333Zm0 7.556c0 .736.597 1.333 1.333 1.333h2.223V12.89H4v4Zm11.556-4h-1.778v.889a.888.888 0 0 1-.89.889h-1.777a.888.888 0 0 1-.889-.89v-.888H8.444v5.333h7.112V12.89Zm3.11 5.333c.737 0 1.334-.597 1.334-1.333v-4h-3.556v5.333h2.223ZM20 9.333a3.555 3.555 0 0 0-3.556-3.555V12H20V9.333ZM15.556 12V5.778H8.444V12h1.778v-.889c0-.492.397-.889.89-.889h1.777c.492 0 .889.398.889.89V12h1.778Zm-3.112-.444c0-.245-.2-.445-.444-.445s-.444.2-.444.445v1.777c0 .245.2.445.444.445s.444-.2.444-.445v-1.777Z"
        />
      </svg>
    ),
  ),
);

ChestIcon.displayName = "ChestIcon";
