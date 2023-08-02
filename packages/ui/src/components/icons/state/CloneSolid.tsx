import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const CloneSolidIcon = memo(
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
          d="M4 18c0 1.103.897 2 2 2h7c1.103 0 2-.897 2-2v-2h-4a3 3 0 0 1-3-3V9H6c-1.103 0-2 .897-2 2v7Zm7-3h7c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-7c-1.103 0-2 .897-2 2v7c0 1.103.897 2 2 2Z"
        />
      </Icon>
    );
  },
);
