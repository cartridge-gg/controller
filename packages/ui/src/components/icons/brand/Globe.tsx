import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const GlobeIcon = memo(
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
          d="M18.1875 14H17.5L16 12.5V10H17V9H15V10.5H12.5H12V11.5H10V10.5L12.5 8V7.5H11V6.5L12 5.5C15.5906 5.5 18.5 8.40938 18.5 12C18.5 12.6969 18.3906 13.3687 18.1875 14ZM17.7688 15C16.7563 16.9406 14.7937 18.3062 12.5 18.4812V17.5H10.5L9 16V12.5H13.5L15 14H16L17 15H17.7688ZM12 20L12.8188 19.9594C12.55 19.9875 12.2781 20 12 20ZM12.8188 19.9594C16.8531 19.55 20 16.1438 20 12C20 7.58125 16.4187 4 12 4C7.58125 4 4 7.58125 4 12C4 15.9844 6.9125 19.2906 10.7281 19.9C11.1438 19.9656 11.5687 20 12 20M9.85313 7.85313L8.85313 8.85313L8.5 9.20625L7.79375 8.5L8.14687 8.14687L9.14687 7.14687L9.5 6.79375L10.2063 7.5L9.85313 7.85313Z"
          fill="currentColor"
        />
      </Icon>
    );
  },
);
