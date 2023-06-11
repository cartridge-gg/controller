import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const EntitiesSSolidIcon = memo(
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
          d="M4.11 7.682a1 1 0 0 1 1-1h13.36a1 1 0 0 1 1 1v4.941a1 1 0 0 1-.455.838l-6.728 4.38a2 2 0 0 1-1.092.324H5.11a1 1 0 0 1-1-1V7.682Z"
        />
      </Icon>
    );
  },
);
