import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ArrowFromLineRightIcon = memo(
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
          d="M5.721 18.857h-1.72V5.143h1.72v13.714Zm13.613-7.482L20 12l-6.143 5.782-1.175-1.25.625-.586 3.282-3.089h-8.41v-1.714h8.41l-3.907-3.679 1.175-1.25.625.586 4.857 4.571-.004.004Z"
        />
      </Icon>
    );
  },
);
