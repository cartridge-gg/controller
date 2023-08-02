import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const GemDuoIcon = memo(
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
          fill={accentToken}
          d="M11.937 8.979a.276.276 0 0 0-.363-.034.27.27 0 0 0-.072.357l1.952 3.25-5.006.419a.273.273 0 0 0 0 .544l6.53.544h.044l6.529-.544a.273.273 0 0 0 0-.544l-5.002-.415 1.951-3.25a.27.27 0 0 0-.07-.358.276.276 0 0 0-.365.034l-3.064 3.316-3.064-3.32Z"
        />
        <path
          fill="currentToken"
          fillOpacity=".32"
          fillRule="evenodd"
          d="M8.776 6.36c.347-.471.903-.76 1.498-.76h9.453c.587 0 1.148.278 1.5.762l.002.003 4.407 5.98v.002c.53.717.471 1.699-.113 2.352l-.004.005-9.143 10.088c-.349.38-.843.607-1.375.607a1.868 1.868 0 0 1-1.376-.607l-.005-.005-9.138-10.083a1.862 1.862 0 0 1-.117-2.358L8.776 6.36Zm1.476 1.088L5.84 13.435a.028.028 0 0 0 0 .037l9.134 10.079h.001c.007.008.012.011.016.013a.021.021 0 0 0 .02 0 .051.051 0 0 0 .016-.013l9.13-10.074a.039.039 0 0 0 .01-.024c0-.004 0-.008-.002-.01a.022.022 0 0 0-.003-.008l-4.416-5.993c-.003-.003-.008-.008-.019-.008h-9.453s-.004 0-.01.003a.037.037 0 0 0-.012.01Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
