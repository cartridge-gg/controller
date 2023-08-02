import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const EthereumIcon = memo(
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
          d="M16.7469 12.15L12 15.05L7.25 12.15L12 4L16.7469 12.15ZM12 15.9812L7.25 13.0813L12 20L16.75 13.0813L12 15.9812Z"
          fill="currentColor"
        />
      </Icon>
    );
  },
);
