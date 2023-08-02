import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const TransferDuoIcon = memo(
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
          d="M25.999 20.961c0 .8-.615 1.414-1.375 1.414H10.88l-.005 3.093a1.03 1.03 0 0 1-1.733.756L4.33 21.756a1.03 1.03 0 0 1 0-1.512l4.812-4.469a1.032 1.032 0 0 1 1.733.756l.005 3.094h13.744c.76 0 1.375.614 1.375 1.336Z"
        />
        <path
          fill={accentToken}
          d="m25.668 9.244-4.812-4.468a1.033 1.033 0 0 0-1.733.756l-.003 3.094H5.376C4.616 8.626 4 9.24 4 9.962c0 .722.615 1.414 1.375 1.414H19.12l.004 3.093a1.03 1.03 0 0 0 1.733.756l4.812-4.468a1.028 1.028 0 0 0 0-1.513Z"
        />
      </Icon>
    );
  },
);
