import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const LockIcon = memo(
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
          d="M9.5 8.5V10h5V8.5a2.5 2.5 0 1 0-5 0Zm-2 1.5V8.5a4.501 4.501 0 0 1 9 0V10h.5c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2H7c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h.5Z"
        />
      </Icon>
    );
  },
);
