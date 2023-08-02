import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const PlayIcon = memo(
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
          d="M16.527 10.903c.383.235.617.65.617 1.098 0 .447-.233.863-.617 1.074L8.813 17.79a1.236 1.236 0 0 1-1.3.049 1.286 1.286 0 0 1-.657-1.123v-9.43a1.286 1.286 0 0 1 1.957-1.097l7.714 4.714Z"
        />
      </Icon>
    );
  },
);
