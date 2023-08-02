import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const NewControllerDuoIcon = memo(
  ({
    variant,
    size,
    boxSize = 6,
    colorScheme,
    orientation,
    styleConfig,
    accent = "brand.accent",
    ...iconProps
  }: DuotoneIconProps) => {
    const styles = useStyleConfig("Icon", {
      variant,
      size,
      colorScheme,
      orientation,
      styleConfig,
    });
    const accentToken = useToken("colors", accent as string);

    return (
      <Icon viewBox="0 0 30 31" __css={styles} boxSize={boxSize} {...iconProps}>
        <path
          fill="currentColor"
          fillOpacity=".32"
          fillRule="evenodd"
          d="M16.25 15.605V14.07A4.377 4.377 0 0 0 15 5.5c-2.418 0-4.41 1.959-4.41 4.34 0 1.954 1.342 3.671 3.16 4.224v5.186h.967a7.305 7.305 0 0 1 1.533-3.645ZM15 8.313a.937.937 0 1 0-1.875 0 .937.937 0 1 0 1.875 0Z"
          clipRule="evenodd"
        />
        <path
          fill="currentColor"
          fillOpacity=".32"
          d="M14.717 19.25h-3.522.055v-.625a.622.622 0 0 0-.625-.625h-1.25a.622.622 0 0 0-.625.625v.625H7.5c-.688 0-1.25.562-1.25 1.25v3.75c0 .688.562 1.25 1.25 1.25h9.458a7.32 7.32 0 0 1-2.241-6.25Z"
        />
        <path
          fill={accentToken}
          d="M28 20.166c0 3.313-2.688 6-6 6-3.313 0-6-2.687-6-6 0-3.312 2.688-6 6-6 3.313 0 6 2.688 6 6Zm-6.667-2.704v2h-2c-.366 0-.666.338-.666.667 0 .404.3.666.666.666h2v2c0 .405.3.667.667.667a.646.646 0 0 0 .667-.667v-2h2a.646.646 0 0 0 .666-.666c0-.33-.3-.667-.666-.667h-2v-2c0-.33-.3-.667-.667-.667-.367 0-.667.338-.667.667Z"
        />
      </Icon>
    );
  },
);
