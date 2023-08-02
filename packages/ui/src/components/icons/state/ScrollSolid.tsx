import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ScrollSolidIcon = memo(
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
          d="M3 6.5V8c0 .553.447 1 1 1h2V6.5a1.5 1.5 0 0 0-3 0ZM6.5 5c.313.419.5.938.5 1.5V16c0 1.103.897 2 2 2s2-.897 2-2v-.166c0-1.012.822-1.834 1.834-1.834H18V8a3 3 0 0 0-3-3H6.5Zm11 14c1.934 0 3.5-1.566 3.5-3.5 0-.275-.225-.5-.5-.5h-7.666a.834.834 0 0 0-.834.834V16a3 3 0 0 1-3 3h8.5Z"
        />
      </Icon>
    );
  },
);
