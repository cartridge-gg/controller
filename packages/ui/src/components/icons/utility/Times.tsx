import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const TimesIcon = memo(
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
          d="M18.656 17.212c.41.41.41 1.073 0 1.481a1.052 1.052 0 0 1-1.485 0L12 13.5l-5.207 5.193a1.052 1.052 0 0 1-1.485 0 1.045 1.045 0 0 1 0-1.481l5.208-5.191-5.21-5.232a1.045 1.045 0 0 1 0-1.481 1.052 1.052 0 0 1 1.485 0l5.209 5.233 5.207-5.192a1.052 1.052 0 0 1 1.485 0c.41.408.41 1.072 0 1.48l-5.209 5.192 5.172 5.192Z"
        />
      </Icon>
    );
  },
);
