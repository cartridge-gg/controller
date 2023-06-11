import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const BoltLineIcon = memo(
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
          d="M14.588 4.197a.777.777 0 0 1 1.25.843L13.709 11h3.42c.493 0 .871.378.871.844a.843.843 0 0 1-.284.634l-8.307 7.328a.779.779 0 0 1-1.247-.847L10.29 13H6.807a.807.807 0 0 1-.536-1.41l8.317-7.393Zm.018 1.323L7.315 12H11a.498.498 0 0 1 .472.669l-2.078 5.819L16.744 12H13a.498.498 0 0 1-.41-.213c-.093-.159-.115-.303-.062-.456l2.078-5.81Z"
        />
      </Icon>
    );
  },
);
