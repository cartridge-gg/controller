import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "./types";

export const PencilLineIcon = memo(
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
          d="M16.383 5.221a.748.748 0 0 1 1.06 0l1.333 1.333a.748.748 0 0 1 0 1.06l-1.712 1.718-2.396-2.397 1.715-1.714ZM13.96 7.643l2.396 2.396-6.851 6.852v-.394c0-.276-.226-.5-.501-.5H8.004v-1.002c0-.275-.225-.5-.5-.5h-.395l6.852-6.852Zm-7.869 8.212c.038-.125.085-.247.147-.36h.764v1.002c0 .275.225.5.5.5h1.001v.764a2.05 2.05 0 0 1-.363.147l-2.903.854.854-2.904v-.003ZM18.153 4.514a1.75 1.75 0 0 0-2.478 0L5.89 14.297a2.99 2.99 0 0 0-.757 1.277L4.02 19.36a.498.498 0 0 0 .62.619l3.785-1.114a3.02 3.02 0 0 0 1.277-.757l9.783-9.783a1.75 1.75 0 0 0 0-2.478l-1.333-1.333Zm-3.789 5.81a.502.502 0 0 0 0-.707.502.502 0 0 0-.707 0L9.653 13.62a.502.502 0 0 0 0 .708.502.502 0 0 0 .707 0l4.004-4.005Z"
        />
      </Icon>
    );
  },
);
