import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const RobotIcon = memo(
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
          d="M12.9 4.8v2.7h5.4v11.7H5.7V7.5h5.4V4.8h1.8ZM8.85 15.6H8.4v.9h1.8v-.9H8.85Zm2.7 0h-.45v.9h1.8v-.9h-1.35Zm2.7 0h-.45v.9h1.8v-.9h-1.35ZM10.425 12a1.125 1.125 0 1 0-2.25 0 1.125 1.125 0 0 0 2.25 0Zm4.275 1.125a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25ZM4.8 11.1v5.4H3v-5.4h1.8Zm16.2 0v5.4h-1.8v-5.4H21Z"
        />
      </Icon>
    );
  },
);
