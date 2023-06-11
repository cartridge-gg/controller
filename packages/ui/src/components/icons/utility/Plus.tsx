import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const PlusIcon = memo(
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
          d="M13.923 20v-6.288H20V10.32h-6.077V4h-3.846v6.321H4v3.39h6.077V20h3.846Z"
        />
      </Icon>
    );
  },
);
