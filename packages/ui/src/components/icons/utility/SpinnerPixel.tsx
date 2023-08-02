import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const SpinnerPixelIcon = memo(
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
        <path fill="currentColor" d="M13 5h2v2h-2z" opacity=".75" />
        <path
          fill="currentColor"
          d="M9 5h2v2H9V5ZM11 5h2v2h-2V5ZM7 7h2v2H7V7ZM5 9h2v2H5V9ZM5 11h2v2H5v-2ZM5 13h2v2H5v-2ZM7 15h2v2H7v-2Z"
        />
        <path fill="currentColor" d="M9 17h2v2H9z" opacity=".5" />
      </Icon>
    );
  },
);
