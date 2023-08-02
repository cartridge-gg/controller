import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const WedgeUpIcon = memo(
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
          d="M12 9.25c.176 0 .352.067.486.201l4.125 4.125a.687.687 0 1 1-.972.973L12 10.909l-3.64 3.639a.687.687 0 1 1-.971-.972l4.125-4.125c.134-.134.31-.201.486-.201Z"
        />
      </Icon>
    );
  },
);
