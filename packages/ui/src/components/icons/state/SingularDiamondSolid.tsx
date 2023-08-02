import { memo } from "react";
import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export const SingularDiamondSolidIcon = memo(
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
          d="M11.975 4.99a.565.565 0 0 0-.274.086l-7.109 6.447a.563.563 0 0 0 0 .956l7.11 6.446a.563.563 0 0 0 .597 0l7.108-6.446a.563.563 0 0 0 .001-.956l-7.109-6.447a.56.56 0 0 0-.324-.087Z"
        />
      </Icon>
    );
  },
);
