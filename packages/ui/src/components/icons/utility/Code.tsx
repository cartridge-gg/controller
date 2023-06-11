import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const CodeIcon = memo(
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
          d="m13.614 4.74-.209.652-4.113 12.796-.208.651 1.305.42.209-.651L14.71 5.812l.208-.651-1.305-.42Zm1.76 3.865.5.469L18.993 12l-3.12 2.928-.5.468.936 1 .5-.468 3.656-3.428.534-.5-.534-.5-3.656-3.427-.5-.468-.937 1Zm-7.684-1-.5.469L3.534 11.5l-.534.5.534.5L7.19 15.93l.5.468.937-1-.5-.468L5.005 12l3.122-2.927.5-.469-.937-1Z"
        />
      </Icon>
    );
  },
);
