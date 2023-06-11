import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ETHColorIcon = memo(
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
          fill="#627EEA"
          d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11Z"
        />
        <path
          fill="#fff"
          fill-opacity=".602"
          d="M11.999 4v5.915l4.999 2.233-5-8.148Z"
        />
        <path fill="#fff" d="m11.999 4-5 8.148 5-2.233V4Z" />
        <path
          fill="#fff"
          fill-opacity=".602"
          d="M11.999 15.981V20L17 13.08 12 15.98Z"
        />
        <path fill="#fff" d="M11.999 20v-4.02l-5-2.9 5 6.92Z" />
        <path
          fill="#fff"
          fill-opacity=".2"
          d="m11.999 15.051 4.999-2.902-5-2.233v5.135Z"
        />
        <path
          fill="#fff"
          fill-opacity=".602"
          d="m6.999 12.149 5 2.902V9.916l-5 2.232Z"
        />
      </Icon>
    );
  },
);
