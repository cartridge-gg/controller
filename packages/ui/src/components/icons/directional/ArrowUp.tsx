import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ArrowIcon = memo(
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
          d="M12 20a.862.862 0 0 1-.864-.86V7.003l-4.553 4.75a.865.865 0 0 1-1.22.028.857.857 0 0 1-.03-1.214l6.042-6.299a.87.87 0 0 1 1.25-.001l6.043 6.299a.859.859 0 0 1-.031 1.215.865.865 0 0 1-1.22-.03l-4.554-4.748v12.17c0 .474-.389.828-.863.828Z"
        />
      </Icon>
    );
  },
);
