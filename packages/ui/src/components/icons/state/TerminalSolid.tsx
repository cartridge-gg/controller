import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const TerminalSolidIcon = memo(
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
          d="M4.5 7.313c0-1.035.84-1.875 1.875-1.875h11.25c1.034 0 1.875.84 1.875 1.875v9.375c0 1.034-.84 1.875-1.875 1.875H6.375A1.877 1.877 0 0 1 4.5 16.688V7.313Zm2.997 1.634a.7.7 0 0 0 .044.993L9.788 12l-2.247 2.06a.704.704 0 0 0 .95 1.037l2.812-2.578a.699.699 0 0 0 0-1.038L8.49 8.903a.7.7 0 0 0-.993.044Zm4.269 5.397a.701.701 0 0 0-.704.703c0 .39.314.703.704.703h4.218c.39 0 .704-.313.704-.703a.701.701 0 0 0-.704-.703h-4.218Z"
        />
      </Icon>
    );
  },
);
