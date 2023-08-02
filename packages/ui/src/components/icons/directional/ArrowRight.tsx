import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ArrowRightIcon = memo(
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
          d="m13.45 5.38 6.284 6a.858.858 0 0 1 0 1.24l-6.285 6a.858.858 0 0 1-1.183-1.24l4.74-4.522H4.856a.858.858 0 0 1 0-1.714h12.146l-4.74-4.521a.86.86 0 0 1-.028-1.214c.329-.343.84-.355 1.214-.03Z"
        />
      </Icon>
    );
  },
);
