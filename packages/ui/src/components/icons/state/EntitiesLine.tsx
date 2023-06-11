import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const EntitiesLineIcon = memo(
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
          d="M5.31 4.882v7.1h5.885a.8.8 0 0 0 .437-.13l6.637-4.32v-2.65H5.31Zm-.2-1.2a1 1 0 0 0-1 1v7.5a1 1 0 0 0 1 1h6.085a2 2 0 0 0 1.092-.324l6.728-4.38a1 1 0 0 0 .454-.838V4.682a1 1 0 0 0-1-1H5.11ZM19.383 11.978c.165.28.087.651-.174.828l-5.83 3.68a.531.531 0 0 1-.299.093H4.668c-.309 0-.559-.269-.559-.6 0-.331.25-.6.559-.6h7.962a1 1 0 0 0 .533-.154l5.449-3.434a.537.537 0 0 1 .77.187ZM19.383 15.718c.165.28.087.65-.174.827l-5.63 3.68a.531.531 0 0 1-.298.093H4.668c-.309 0-.559-.269-.559-.6 0-.331.25-.6.559-.6h8.154a1 1 0 0 0 .547-.163l5.243-3.425a.537.537 0 0 1 .77.188Z"
          clip-rule="evenodd"
        />
      </Icon>
    );
  },
);
