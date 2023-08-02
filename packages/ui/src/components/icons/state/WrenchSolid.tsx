import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const WrenchSolidIcon = memo(
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
          d="M15 14a4.999 4.999 0 0 0 4.806-6.381c-.097-.338-.512-.413-.76-.166l-2.4 2.4a.502.502 0 0 1-.352.147H14.5a.501.501 0 0 1-.5-.5V7.706c0-.131.053-.26.147-.353l2.4-2.4c.247-.247.169-.662-.166-.76A4.999 4.999 0 0 0 10 9c0 .598.106 1.173.297 1.704l-5.675 5.675a2.122 2.122 0 1 0 3 3l5.675-5.675A4.964 4.964 0 0 0 15 14Zm-8.5 2.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z"
        />
      </Icon>
    );
  },
);
