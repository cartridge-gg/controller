import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const BatteryDuoIcon = memo(
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
          d="M17.017 9.389h4.705a3.055 3.055 0 0 1 3.056 3.056v.61A1.22 1.22 0 0 1 26 14.279v2.444a1.22 1.22 0 0 1-1.222 1.223v.61a3.055 3.055 0 0 1-3.056 3.056h-8.368c.088-.053.172-.114.256-.183l2.746-2.261h5.366a.613.613 0 0 0 .611-.611v-6.112a.613.613 0 0 0-.61-.61h-3.755a2.145 2.145 0 0 0-.951-2.445ZM11.15 21.61H7.056A3.055 3.055 0 0 1 4 18.556v-6.112A3.055 3.055 0 0 1 7.056 9.39h7.757c-.088.054-.172.08-.256.183l-2.746 2.261H7.056a.612.612 0 0 0-.612.611v6.112c0 .336.274.61.612.61h3.143c-.252.849.046 1.78.768 2.323.057.011.118.084.183.122Z"
        />
        <path
          fill={accentToken}
          d="M15.011 14.889h2.434c.26 0 .488.16.576.405.084.21.012.515-.187.68L12.64 20.25a.619.619 0 0 1-.757.016.61.61 0 0 1-.194-.73l1.466-3.46h-2.433c-.26 0-.489-.126-.576-.37a.62.62 0 0 1 .187-.68l5.194-4.278c.218-.21.531-.184.756-.016.226.168.306.47.195.73l-1.467 3.426Z"
        />
      </Icon>
    );
  },
);
