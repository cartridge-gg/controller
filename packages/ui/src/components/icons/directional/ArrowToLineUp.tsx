import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ArrowLineUpIcon = memo(
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
          d="M6 4a.855.855 0 0 0-.857.857c0 .475.382.857.857.857h12a.855.855 0 0 0 .857-.857A.855.855 0 0 0 18 4H6Zm6.625 4.843a.854.854 0 0 0-1.25 0L6.804 13.7a.857.857 0 0 0 1.246 1.175l3.093-3.286v7.554c0 .475.382.857.857.857a.855.855 0 0 0 .857-.857v-7.554l3.09 3.282a.857.857 0 0 0 1.246-1.175L12.62 8.84l.004.004Z"
        />
      </Icon>
    );
  },
);
