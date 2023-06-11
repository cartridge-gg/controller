import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const EntitiesSolidIcon = memo(
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
          d="M4.11 4.707a1 1 0 0 1 1-1h13.36a1 1 0 0 1 1 1v2.958a1 1 0 0 1-.455.838l-6.728 4.38a2 2 0 0 1-1.092.324H5.11a1 1 0 0 1-1-1v-7.5Z"
        />
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M19.383 12.003c.165.28.087.651-.174.828l-5.83 3.68a.531.531 0 0 1-.299.093H4.668c-.309 0-.559-.269-.559-.6 0-.331.25-.6.559-.6h7.962a1 1 0 0 0 .533-.154l5.449-3.434a.537.537 0 0 1 .77.187ZM19.383 15.743c.165.28.087.65-.174.827l-5.63 3.68a.531.531 0 0 1-.298.093H4.668c-.309 0-.559-.268-.559-.6 0-.331.25-.6.559-.6h8.154a1 1 0 0 0 .547-.163l5.243-3.424a.537.537 0 0 1 .77.187Z"
          clip-rule="evenodd"
        />
      </Icon>
    );
  },
);
