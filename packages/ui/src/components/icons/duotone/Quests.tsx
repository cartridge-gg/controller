import { memo } from "react";
import { Icon, useStyleConfig, useToken } from "@chakra-ui/react";
import { DuotoneIconProps } from "../types";

export const QuestsDuoIcon = memo(
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
          d="M21.69 8.861v12.394h3.425c.488 0 .885.395.884.884a3.044 3.044 0 0 1-3.04 3.04H11.35a3.043 3.043 0 0 1-3.04-3.04V9.744H4.883A.884.884 0 0 1 4 8.86a3.043 3.043 0 0 1 3.04-3.039l11.61.001a3.043 3.043 0 0 1 3.04 3.04Zm-10.34 14.55c.7 0 1.27-.571 1.27-1.272 0-.488.396-.884.885-.884h6.416V8.861c0-.7-.57-1.27-1.27-1.27-.7 0-1.271.57-1.271 1.27a.884.884 0 0 1-.884.884h-6.417V22.14c0 .7.57 1.271 1.27 1.271Z"
          clipRule="evenodd"
        />
        <path
          fill={accentToken}
          fillRule="evenodd"
          d="M16.949 18.385a.885.885 0 0 1-.625-.257l-1.312-1.313-1.313 1.312a.882.882 0 0 1-1.249 0 .885.885 0 0 1 0-1.25l1.311-1.312-1.311-1.312a.885.885 0 0 1 1.25-1.251l1.312 1.311 1.311-1.311a.885.885 0 0 1 1.25 1.25l-1.31 1.313 1.31 1.311a.885.885 0 0 1-.624 1.51Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
