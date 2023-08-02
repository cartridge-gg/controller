import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ArrowDownIcon = memo(
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
          d="M12 4c.477 0 .864.385.864.86v12.138l4.553-4.75a.865.865 0 0 1 1.22-.028.857.857 0 0 1 .03 1.214l-6.042 6.299a.87.87 0 0 1-1.25 0l-6.043-6.298a.859.859 0 0 1 .03-1.215.865.865 0 0 1 1.221.03l4.554 4.748V4.828c0-.474.388-.828.863-.828Z"
        />
      </Icon>
    );
  },
);
