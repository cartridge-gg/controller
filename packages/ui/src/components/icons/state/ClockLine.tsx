import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ClockLineIcon = memo(
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
          d="M18.5 12a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0ZM4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Zm7.25-4.25V12c0 .25.125.484.334.625l3 2a.748.748 0 0 0 1.041-.21.748.748 0 0 0-.21-1.04L12.75 11.6V7.75A.748.748 0 0 0 12 7a.748.748 0 0 0-.75.75Z"
        />
      </Icon>
    );
  },
);
