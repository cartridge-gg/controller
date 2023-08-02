import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const SparklesDuoIcon = memo(
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
          d="M18.352 7.493 21 6.5l.994-2.649a.541.541 0 0 1 1.012 0L24 6.5l2.648.993a.542.542 0 0 1 0 1.013L24 9.5l-.994 2.648a.542.542 0 0 1-1.012 0L21 9.5l-2.648-.994C18.098 8.426 18 8.225 18 8c0-.225.098-.428.352-.507Zm3.642 11.359c.08-.254.281-.352.506-.352.225 0 .427.098.506.352L24 21.5l2.648.994a.542.542 0 0 1 0 1.012L24 24.5l-.994 2.648a.542.542 0 0 1-1.012 0L21 24.5l-2.648-.994c-.254-.08-.352-.281-.352-.506 0-.225.098-.427.352-.506L21 21.5l.994-2.648Z"
        />
        <path
          fill={accentToken}
          d="M11.25 6.935a.752.752 0 0 1 1.364 0l2.47 5.345 5.344 2.47c.267.122.436.39.436.684 0 .291-.169.558-.436.68l-5.344 2.47-2.47 5.344a.747.747 0 0 1-.68.436.749.749 0 0 1-.684-.436l-2.47-5.344-5.344-2.47a.751.751 0 0 1 0-1.364l5.344-2.47 2.47-5.345Zm-.427 6.292a2.268 2.268 0 0 1-1.096 1.096l-2.4 1.111 2.4 1.107c.482.182.871.614 1.096 1.096l1.111 2.4 1.107-2.4a1.97 1.97 0 0 1 1.096-1.096l2.4-1.107-2.4-1.11c-.482-.226-.914-.615-1.096-1.097l-1.107-2.4-1.11 2.4Z"
        />
      </Icon>
    );
  },
);
