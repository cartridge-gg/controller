import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const TrashIcon = memo(
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
          d="M9.225 4.553 9 5H6a.999.999 0 1 0 0 2h12a.999.999 0 1 0 0-2h-3l-.225-.447A.996.996 0 0 0 13.881 4H10.12a.996.996 0 0 0-.894.553ZM18 8H6l.662 10.594c.05.79.707 1.406 1.497 1.406h7.682c.79 0 1.447-.616 1.496-1.406L18 8Z"
        />
      </Icon>
    );
  },
);
