import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const HamburgerIcon = memo(
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
          d="M4 6.286c0-.474.384-.858.857-.858h14.286a.856.856 0 1 1 0 1.715H4.857A.856.856 0 0 1 4 6.286ZM4 12c0-.475.384-.857.857-.857h14.286c.475 0 .857.382.857.857a.855.855 0 0 1-.857.857H4.857A.856.856 0 0 1 4 12Zm15.143 6.571H4.857a.856.856 0 1 1 0-1.714h14.286c.475 0 .857.382.857.857a.855.855 0 0 1-.857.857Z"
        />
      </Icon>
    );
  },
);
