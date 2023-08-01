import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "./types";

export const MetricsSolidIcon = memo(
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
          d="M12.033 11.498V4.49c0-.282.22-.52.501-.52a7.027 7.027 0 0 1 7.027 7.026.512.512 0 0 1-.52.502h-7.008ZM3.5 12.502a7.529 7.529 0 0 1 6.493-7.457.475.475 0 0 1 .534.484v7.475l4.91 4.91c.21.21.194.554-.048.724A7.529 7.529 0 0 1 3.5 12.502Zm16.513.502c.292 0 .52.245.483.533a7.502 7.502 0 0 1-2.318 4.464.477.477 0 0 1-.665-.022l-4.979-4.975h7.479Z"
        />
      </Icon>
    );
  },
);
