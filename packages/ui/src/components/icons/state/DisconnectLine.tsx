import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const DisconnectLineIcon = memo(
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
          fill-rule="evenodd"
          d="M18 1.608a.5.5 0 0 0-.683.183L14.021 7.5H9v-.75A1.75 1.75 0 0 0 7.25 5h-2.5A1.75 1.75 0 0 0 3 6.75v2.5c0 .966.783 1.75 1.75 1.75h2.5c.269 0 .522-.06.722-.169l2.284 3.01a1.344 1.344 0 0 0-.231.58l-3.208 5.556a.5.5 0 0 0 .866.5l10.5-18.186A.5.5 0 0 0 18 1.608Zm-7.142 11.37L13.443 8.5H9v.75c0 .334-.094.644-.256.91l2.114 2.819ZM4.75 6h2.5a.75.75 0 0 1 .75.75v2.5c0 .415-.334.75-.75.75h-2.5A.75.75 0 0 1 4 9.25v-2.5A.75.75 0 0 1 4.75 6Z"
          clip-rule="evenodd"
        />
        <path
          fill="currentColor"
          d="m13.155 13-.578 1h1.673c.416 0 .75.334.75.75v2.5c0 .416-.334.75-.75.75h-2.5a.748.748 0 0 1-.75-.75v-.518l-.785 1.359A1.75 1.75 0 0 0 11.75 19h2.5c.966 0 1.75-.785 1.75-1.75v-2.5A1.75 1.75 0 0 0 14.25 13h-1.095ZM16 8.072l-.941 1.63c.2.747.882 1.298 1.691 1.298h2.5A1.75 1.75 0 0 0 21 9.25v-2.5A1.75 1.75 0 0 0 19.25 5h-1.477l-.577 1h2.054a.75.75 0 0 1 .75.75v2.5c0 .415-.334.75-.75.75h-2.5a.748.748 0 0 1-.75-.75V8.072Z"
        />
      </Icon>
    );
  },
);
