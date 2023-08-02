import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const StackShapeLineIcon = memo(
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
          fillRule="evenodd"
          d="M5.31 7.882v9.083h5.885a.8.8 0 0 0 .437-.13l6.637-4.32V7.882H5.31Zm-.2-1.2a1 1 0 0 0-1 1v9.483a1 1 0 0 0 1 1h6.085a2 2 0 0 0 1.092-.324l6.728-4.38a1 1 0 0 0 .454-.838V7.682a1 1 0 0 0-1-1H5.11Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
