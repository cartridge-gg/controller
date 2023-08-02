import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const StarterpackDuoIcon = memo(
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
          d="M8.212 7a4.583 4.583 0 0 0-4.583 4.583V21.82a2.292 2.292 0 0 0 2.292 2.292h17.416a2.292 2.292 0 0 0 2.292-2.292V11.583A4.583 4.583 0 0 0 21.046 7H8.212Zm10.542 1.528h-8.25v4.965a.23.23 0 0 1-.23.23H9.206a.23.23 0 0 1-.229-.23V8.528h-.764a3.056 3.056 0 0 0-3.055 3.055V21.82c0 .422.342.764.764.764h3.055v-4.048a.23.23 0 0 1 .23-.23h1.069a.23.23 0 0 1 .229.23v4.048h8.25v-4.048a.23.23 0 0 1 .23-.23h1.068a.23.23 0 0 1 .23.23v4.048h3.055a.764.764 0 0 0 .764-.764V11.583a3.056 3.056 0 0 0-3.055-3.055h-.764v4.965a.23.23 0 0 1-.23.23h-1.069a.23.23 0 0 1-.23-.23V8.528Z"
          clipRule="evenodd"
        />
        <path
          fill={accentToken}
          d="M13.56 12.958a.458.458 0 0 0-.459.459v2.139H7.455a.23.23 0 0 0-.229.229v.458c0 .127.103.23.23.23H13.1v2.138c0 .253.205.459.458.459h2.14a.458.458 0 0 0 .458-.459v-2.139h5.645a.23.23 0 0 0 .23-.229v-.458a.23.23 0 0 0-.23-.23h-5.645v-2.138a.458.458 0 0 0-.459-.459H13.56Z"
        />
      </Icon>
    );
  },
);
