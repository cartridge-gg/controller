import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ComponentsSLineIcon = memo(
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
          fill-rule="evenodd"
          d="m5.851 12.001 6.15 5.575 6.147-5.575L12 6.425 5.851 12ZM12.3 5.076l7.109 6.447a.562.562 0 0 1 0 .956l-7.109 6.446a.563.563 0 0 1-.598 0L4.592 12.48a.563.563 0 0 1 0-.956l7.11-6.447a.56.56 0 0 1 .598 0Z"
          clip-rule="evenodd"
        />
      </Icon>
    );
  },
);
