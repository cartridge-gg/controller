import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const EyeSolidIcon = memo(
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
          d="M11.999 5.778c-2.245 0-4.042 1.022-5.35 2.239-1.3 1.205-2.17 2.65-2.58 3.641a.883.883 0 0 0 0 .684c.41.991 1.28 2.435 2.58 3.641C7.957 17.2 9.754 18.222 12 18.222c2.244 0 4.04-1.022 5.35-2.239 1.299-1.208 2.168-2.65 2.582-3.641a.884.884 0 0 0 0-.684c-.414-.991-1.283-2.436-2.583-3.641-1.308-1.217-3.105-2.239-5.35-2.239Zm-4 6.222a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm4-1.778a1.78 1.78 0 0 1-2.342 1.686c-.153-.05-.33.045-.325.206a2.668 2.668 0 1 0 2.78-2.78c-.16-.006-.255.169-.205.325.058.177.092.366.092.563Z"
        />
      </Icon>
    );
  },
);
