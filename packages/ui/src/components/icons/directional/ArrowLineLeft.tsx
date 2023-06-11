import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ArrowLineLeftIcon = memo(
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
          d="M4 18c0 .475.382.857.857.857A.855.855 0 0 0 5.714 18V6a.855.855 0 0 0-.857-.857A.855.855 0 0 0 4 6v12Zm4.843-6.625a.854.854 0 0 0 0 1.25l4.857 4.571a.857.857 0 0 0 1.175-1.246l-3.286-3.093h7.554A.855.855 0 0 0 20 12a.855.855 0 0 0-.857-.857h-7.554l3.282-3.09a.857.857 0 0 0-1.175-1.246L8.84 11.38l.004-.004Z"
        />
      </Icon>
    );
  },
);
