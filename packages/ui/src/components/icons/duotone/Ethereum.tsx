import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const EthereumDuoIcon = memo(
  ({
    variant,
    size,
    boxSize = 6,
    colorScheme,
    orientation,
    styleConfig,
    accent = "brand.accent",
    accentHighlight = "brand.accentHighlight",
    ...iconProps
  }: DuotoneIconProps) => {
    const styles = useStyleConfig("Icon", {
      variant,
      size,
      colorScheme,
      orientation,
      styleConfig,
    });
    const [accentToken, accentHighlightToken] = useToken("colors", [
      accent as string,
      accentHighlight as string,
    ]);

    return (
      <Icon viewBox="0 0 30 31" __css={styles} boxSize={boxSize} {...iconProps}>
        <path
          fill={accentHighlightToken}
          d="M14.997 4.5v8.132l6.874 3.072L14.997 4.5Z"
        />
        <path
          fill={accentToken}
          d="M14.999 4.5 8.124 15.704l6.875-3.072V4.5Z"
        />
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="M14.997 20.974V26.5l6.879-9.516-6.879 3.99Z"
        />
        <path
          fill={accentToken}
          d="M14.999 26.5v-5.527l-6.875-3.989 6.875 9.516Z"
        />
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="m14.997 19.695 6.874-3.99-6.874-3.07v7.06Z"
        />
        <path
          fill={accentHighlightToken}
          d="m8.124 15.704 6.875 3.991v-7.06l-6.875 3.07Z"
        />
      </Icon>
    );
  },
);
