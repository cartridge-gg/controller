import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const CopyIcon = memo(
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
          d="M6 19h7c.553 0 1-.447 1-1v-1.5c0-.275.225-.5.5-.5s.5.225.5.5V18c0 1.103-.897 2-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1.5c.275 0 .5.225.5.5s-.225.5-.5.5H6a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1ZM9 6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7c0 1.103-.897 2-2 2h-7c-1.103 0-2-.897-2-2V6Zm2 8h7c.553 0 1-.447 1-1V6a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v7c0 .553.447 1 1 1Z"
        />
      </Icon>
    );
  },
);
