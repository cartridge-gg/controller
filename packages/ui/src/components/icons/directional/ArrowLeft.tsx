import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const ArrowLeftIcon = memo(
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
          d="M20 12a.858.858 0 0 1-.86.855H7.003l4.75 4.508a.85.85 0 0 1 .028 1.209.863.863 0 0 1-1.214.029l-6.299-5.982A.843.843 0 0 1 4 12c0-.235.096-.456.266-.62l6.299-5.982a.865.865 0 0 1 1.215.03.85.85 0 0 1-.03 1.21l-4.748 4.507h12.17c.474 0 .828.385.828.855Z"
        />
      </Icon>
    );
  },
);
