import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const SystemsSolidIcon = memo(
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
          d="M19.75 8.626c0 2.18-3.47 3.947-7.75 3.947-4.28 0-7.75-1.767-7.75-3.947S7.72 4.68 12 4.68c4.28 0 7.75 1.767 7.75 3.946Z"
        />
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M19.669 13.347a.662.662 0 0 1-.264.897c-2.107 1.15-4.018 1.917-7.484 1.917-3.485 0-5.266-.883-7.306-1.906a.662.662 0 0 1 .593-1.183c1.976.99 3.536 1.765 6.713 1.765 3.196 0 4.89-.684 6.85-1.754a.662.662 0 0 1 .898.264Z"
          clip-rule="evenodd"
        />
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M19.669 16.505a.662.662 0 0 1-.264.898c-2.107 1.15-4.018 1.917-7.484 1.917-3.485 0-5.266-.883-7.306-1.906a.662.662 0 1 1 .593-1.183c1.976.99 3.536 1.765 6.713 1.765 3.196 0 4.89-.684 6.85-1.754a.662.662 0 0 1 .898.263Z"
          clip-rule="evenodd"
        />
      </Icon>
    );
  },
);
