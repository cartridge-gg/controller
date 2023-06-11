import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const PacmanIcon = memo(
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
          d="M19.391 15.062a8 8 0 1 1 0-6.123L12 12l7.391 3.062Z"
        />
      </Icon>
    );
  },
);
