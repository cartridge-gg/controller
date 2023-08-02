import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const LogoutDuoIcon = memo(
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
          fill={accentToken}
          d="M25.05 16.447 26 15.5l-.946-.946-5.361-5.361-.95-.95-1.898 1.896.947.947 3.074 3.074H10.7v2.68h10.165l-3.074 3.074-.947.947 1.897 1.897.947-.946 5.36-5.361v-.004Z"
        />
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="M10.7 8.799h1.341v-2.68H4V24.88h8.041v-2.68H6.681V8.799h4.02Z"
        />
      </Icon>
    );
  },
);
