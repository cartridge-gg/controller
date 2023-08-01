import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "./types";

export const GridSolidIcon = memo(
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
          d="M10.929 6.107c0-.887-.72-1.607-1.608-1.607H6.107C5.22 4.5 4.5 5.22 4.5 6.107v3.214c0 .888.72 1.608 1.607 1.608h3.214c.888 0 1.608-.72 1.608-1.608V6.107Zm0 8.572c0-.888-.72-1.608-1.608-1.608H6.107c-.887 0-1.607.72-1.607 1.608v3.214c0 .887.72 1.607 1.607 1.607h3.214c.888 0 1.608-.72 1.608-1.607v-3.214Zm2.142-8.572v3.214c0 .888.72 1.608 1.608 1.608h3.214c.887 0 1.607-.72 1.607-1.608V6.107c0-.887-.72-1.607-1.607-1.607h-3.214c-.888 0-1.608.72-1.608 1.607ZM19.5 14.68c0-.888-.72-1.608-1.607-1.608h-3.214c-.888 0-1.608.72-1.608 1.608v3.214c0 .887.72 1.607 1.608 1.607h3.214c.887 0 1.607-.72 1.607-1.607v-3.214Z"
        />
      </Icon>
    );
  },
);
