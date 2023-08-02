import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const MoonLineIcon = memo(
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
          d="M11.947 5.243a7.418 7.418 0 0 0-2.246 5.328c0 3.89 2.982 7.083 6.782 7.404-.993.56-2.14.882-3.36.882-3.78 0-6.84-3.068-6.84-6.857a6.856 6.856 0 0 1 5.664-6.757Zm2.361-.768a.57.57 0 0 0-.51-.446 8.548 8.548 0 0 0-.68-.029C8.713 4 5.14 7.582 5.14 12s3.572 8 7.982 8a7.954 7.954 0 0 0 5.565-2.264.57.57 0 0 0-.497-.972c-.35.061-.707.093-1.075.093-3.46 0-6.268-2.814-6.268-6.286a6.284 6.284 0 0 1 3.19-5.475.57.57 0 0 0 .275-.617l-.004-.004Z"
        />
      </Icon>
    );
  },
);
