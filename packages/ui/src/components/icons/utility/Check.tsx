import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

export function CheckIcon({
  variant,
  size,
  colorScheme,
  orientation,
  styleConfig,
  ...iconProps
}: Props) {
  const styles = useStyleConfig("Icon", {
    variant,
    size,
    colorScheme,
    orientation,
    styleConfig,
  });

  return (
    <Icon
      viewBox="0 0 9 8"
      w="9px"
      h="8px"
      fill="currentColor"
      __css={styles}
      {...iconProps}
    >
      <path d="M2.21999 7.27278L0.0380859 5.09087L0.765223 4.36373L2.21999 5.8185L7.31095 0.727051L8.03809 1.45467L2.21999 7.27278Z" />
    </Icon>
  );
}
