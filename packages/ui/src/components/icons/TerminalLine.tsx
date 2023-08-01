import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "./types";

export const TerminalLineIcon = memo(
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
          d="M17.625 6.375c.519 0 .938.419.938.938v9.375a.936.936 0 0 1-.938.937H6.375a.936.936 0 0 1-.938-.938V7.313c0-.518.42-.937.938-.937h11.25Zm-11.25-.938c-1.034 0-1.875.841-1.875 1.875v9.375c0 1.035.84 1.875 1.875 1.875h11.25c1.034 0 1.875-.84 1.875-1.875V7.313c0-1.034-.84-1.875-1.875-1.875H6.375Zm1.052 3.446a.47.47 0 0 0 .05.662L10.342 12l-2.865 2.458a.469.469 0 1 0 .612.712l3.281-2.813a.462.462 0 0 0 0-.709L8.09 8.836a.47.47 0 0 0-.662.05v-.003Zm3.636 5.93a.47.47 0 0 0-.47.468c0 .258.212.469.47.469h5.156a.47.47 0 0 0 .468-.469.47.47 0 0 0-.468-.469h-5.157Z"
        />
      </Icon>
    );
  },
);
