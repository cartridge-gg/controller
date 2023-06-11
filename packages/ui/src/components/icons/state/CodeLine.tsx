import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const CodeLineIcon = memo(
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
          d="m13.847 9.419 2 2.25a.45.45 0 0 1 0 .662l-2 2.25a.447.447 0 0 1-.678.016.47.47 0 0 1-.044-.678l1.706-1.947-1.706-1.89a.503.503 0 0 1 .044-.707.47.47 0 0 1 .678.044ZM9.169 12l1.678 1.919c.21.178.19.522-.016.678a.478.478 0 0 1-.706-.016l-2-2.25a.504.504 0 0 1 0-.662l2-2.25a.503.503 0 0 1 .706-.044c.207.184.225.5.016.706L9.169 12ZM18 5a2 2 0 0 1 2 2v10c0 1.103-.897 2-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12Zm0 1H6a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12c.553 0 1-.447 1-1V7a1 1 0 0 0-1-1Z"
        />
      </Icon>
    );
  },
);
