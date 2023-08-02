import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const NewLayerDuoIcon = memo(
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
          d="M21.944 7.444a.831.831 0 0 0-.833-.833.831.831 0 0 0-.833.833v1.112h-1.111a.831.831 0 0 0-.834.833c0 .462.372.833.834.833h1.11v1.111c0 .462.372.834.834.834a.831.831 0 0 0 .833-.834v-1.11h1.111a.831.831 0 0 0 .834-.834.831.831 0 0 0-.834-.833h-1.11V7.444Z"
        />
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="M14.184 11.236a1.943 1.943 0 0 1 1.632 0l7.59 3.507a.83.83 0 0 1 .483.757.83.83 0 0 1-.483.757l-7.59 3.507c-.517.24-1.115.24-1.632 0l-7.59-3.507a.834.834 0 0 1 0-1.514l7.59-3.507Zm7.375 7.097 1.847.855a.83.83 0 0 1 .483.756.83.83 0 0 1-.483.757l-7.59 3.507c-.517.24-1.115.24-1.632 0l-7.59-3.507a.834.834 0 0 1 0-1.514l1.847-.854 5.278 2.438c.812.375 1.75.375 2.562 0l5.278-2.438Z"
        />
      </Icon>
    );
  },
);
