import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const WedgeDownIcon = memo(
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
          d="M12 15.5a.747.747 0 0 1-.53-.22l-4.5-4.5a.75.75 0 1 1 1.06-1.06L12 13.69l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.748.748 0 0 1-.53.22Z"
        />
      </Icon>
    );
  },
);
