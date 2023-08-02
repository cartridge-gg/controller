import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const WedgeRightIcon = memo(
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
          d="M14.75 12a.685.685 0 0 1-.201.486l-4.125 4.125a.687.687 0 1 1-.973-.972L13.091 12 9.452 8.36a.687.687 0 1 1 .972-.971l4.125 4.125c.134.134.201.31.201.486Z"
        />
      </Icon>
    );
  },
);
