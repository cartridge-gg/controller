import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const PlugActiveDuoIcon = memo(
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
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="M6.667 6.166v4h2.666v-4a1.333 1.333 0 1 0-2.666 0ZM14.667 6.166v4h2.666v-4a1.333 1.333 0 1 0-2.666 0ZM5.333 11.5a1.333 1.333 0 1 0 0 2.666V15.5c0 3.225 2.29 5.879 5.334 6.533v4.133h2.666v-4.133a6.613 6.613 0 0 0 1.463-.48 7.607 7.607 0 0 1-.13-1.387c0-3.346 2.242-6.204 5.305-7.05a1.332 1.332 0 0 0-1.304-1.617H5.333Z"
        />
        <path
          fill={accentToken}
          fillRule="evenodd"
          d="M22 26.166c3.313 0 6-2.687 6-6 0-3.312-2.688-6-6-6-3.313 0-6 2.688-6 6 0 3.313 2.688 6 6 6Zm-2.064-6.586 5.02-3.011-2.51 3.011 1.674 1.005-5.02 3.012 2.51-3.012-1.674-1.005Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
