import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const CircleNoCheckIcon = memo(
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
          fillRule="evenodd"
          d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 2a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
