import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const MinusIcon = memo(
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
        <path fill="currentColor" d="M20 13.712v-3.391H4v3.391h16Z" />
      </Icon>
    );
  },
);
