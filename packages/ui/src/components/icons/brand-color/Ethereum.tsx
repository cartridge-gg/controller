import { Icon, useStyleConfig } from "@chakra-ui/react";
import { Props } from "../types";

// TODO: Find colored Ethereum Logo or import from Figma
export function EthereumIcon({
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
    <Icon viewBox="0 0 8 14" fill="currentColor" __css={styles} {...iconProps}>
      <path d="M7.91406 7.12498L3.95833 9.54165L0 7.12498L3.95833 0.333313L7.91406 7.12498ZM3.95833 10.3177L0 7.90102L3.95833 13.6666L7.91667 7.90102L3.95833 10.3177V10.3177Z" />
    </Icon>
  );
}
