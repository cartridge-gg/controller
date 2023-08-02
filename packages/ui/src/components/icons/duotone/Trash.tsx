import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const TrashDuoIcon = memo(
  ({
    variant,
    size,
    boxSize = 6,
    colorScheme,
    orientation,
    styleConfig,
    accent = "brand.accent",
    ...iconProps
  }: DuotoneIconProps) => {
    const styles = useStyleConfig("Icon", {
      variant,
      size,
      colorScheme,
      orientation,
      styleConfig,
    });
    const accentToken = useToken("colors", accent as string);

    return (
      <Icon viewBox="0 0 30 31" __css={styles} boxSize={boxSize} {...iconProps}>
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="m20.998 22.91.683-10.566a1 1 0 0 0-.998-1.065H9.317a1 1 0 0 0-.998 1.065l.683 10.567a1.687 1.687 0 0 0 1.684 1.589h8.628c.893 0 1.634-.696 1.684-1.59Z"
        />
        <path
          fill={accentToken}
          d="M12.884 6.5c-.426 0-.816.24-1.006.622l-.253.503H8.25a1.124 1.124 0 1 0 0 2.25h13.5a1.124 1.124 0 1 0 0-2.25h-3.375l-.253-.503a1.12 1.12 0 0 0-1.006-.622h-4.232Z"
        />
      </Icon>
    );
  },
);
