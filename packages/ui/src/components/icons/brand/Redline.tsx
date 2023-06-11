import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const RedlineIcon = memo(
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
          d="M16.1931 18.8144C14.9739 19.5662 13.5376 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 14.1966 19.1147 16.1865 17.6814 17.6322L13.5054 12.0395C13.5054 12.0395 15.1503 11.7245 15.1503 9.65863C15.1503 7.59274 12.9117 7.35041 12.9117 7.35041H7.05938L7.86513 9.20426H11.9242C12.424 9.20426 12.6603 9.44962 12.6603 9.90399C12.6603 10.3584 12.3453 10.6037 11.9242 10.6037C11.5031 10.6037 6.95638 10.6401 6.95638 10.6401L7.76214 12.4242H11.4729L16.1931 18.8144Z"
          fill="currentColor"
        />
      </Icon>
    );
  },
);
