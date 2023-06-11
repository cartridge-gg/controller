import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ConnectSolidIcon = memo(
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
          fill="currentColor"
          d="M3 6.5A1.5 1.5 0 0 1 4.5 5h3A1.5 1.5 0 0 1 9 6.5V7h6v-.5A1.5 1.5 0 0 1 16.5 5h3A1.5 1.5 0 0 1 21 6.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 15 9.5V9H9v.5c0 .053-.003.106-.01.156L11.5 13h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3c0-.053.003-.106.01-.156L7.5 11h-3A1.5 1.5 0 0 1 3 9.5v-3Z"
        />
      </Icon>
    );
  },
);
