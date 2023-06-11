import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ETHLightColorIcon = memo(
  ({
    variant,
    size,
    boxSize = 6,
    colorScheme,
    orientation,
    styleConfig,
    ...iconProps
  }: Props) => {
    const styles = useStyleConfig("Icon", {
      variant,
      size,
      colorScheme,
      orientation,
      styleConfig,
    });

    return (
      <Icon viewBox="0 0 24 24" __css={styles} boxSize={boxSize} {...iconProps}>
        <path
          fill="#000"
          fill-opacity=".06"
          d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11Z"
        />
        <path
          fill="#000"
          fill-opacity=".6"
          d="M11.998 4v5.915l5 2.234-5-8.149Z"
        />
        <path fill="#000" d="m11.998 4-5 8.149 5-2.234V4Z" />
        <path
          fill="#000"
          fill-opacity=".6"
          d="M11.998 15.981V20l5.003-6.921-5.003 2.902Z"
        />
        <path fill="#000" d="M11.998 20v-4.02l-5-2.901 5 6.921Z" />
        <path
          fill="#000"
          fill-opacity=".18"
          d="m11.998 15.051 5-2.902-5-2.233v5.135Z"
        />
        <path
          fill="#000"
          fill-opacity=".6"
          d="m6.999 12.149 5 2.902V9.916l-5 2.233Z"
        />
      </Icon>
    );
  },
);
