import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const TransactionDuoIcon = memo(
  ({
    variant,
    size,
    boxSize = 6,
    colorScheme,
    orientation,
    styleConfig,
    accent = "brand.accent",
    ...iconProps
  }: DuotoneIconProps) => {
    const styles = useStyleConfig("Icon", {
      variant,
      size,
      colorScheme,
      orientation,
      styleConfig,
    });
    const accentToken = useToken("colors", accent as string);

    return (
      <Icon viewBox="0 0 30 31" __css={styles} boxSize={boxSize} {...iconProps}>
        <g clipPath="url(#a)">
          <path
            fill={accentToken}
            d="m21.456 10.544 3.85 3.85c.43.43.43 1.124 0 1.554l-3.85 3.85a1.098 1.098 0 1 1-1.554-1.554l3.07-3.073-3.07-3.073a1.097 1.097 0 1 1 1.554-1.554Zm-12.1 1.554L6.284 15.17l3.072 3.073a1.097 1.097 0 1 1-1.554 1.554l-3.85-3.85a1.098 1.098 0 0 1 0-1.554l3.85-3.85a1.098 1.098 0 1 1 1.554 1.554Z"
          />
          <path
            fill="currentColor"
            fillOpacity=".32"
            d="m17.888 7.773-4.4 15.4a1.104 1.104 0 0 1-1.362.757 1.104 1.104 0 0 1-.756-1.361l4.4-15.4a1.102 1.102 0 0 1 2.118.604Z"
          />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="currentColor" d="M3.629 6.371h22v17.6h-22z" />
          </clipPath>
        </defs>
      </Icon>
    );
  },
);
