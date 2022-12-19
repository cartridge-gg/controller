import type { ComponentStyleConfig } from "@chakra-ui/theme";
import { cssVar } from "@chakra-ui/react";

const $arrowBg = cssVar("popper-arrow-bg");

export const Tooltip: ComponentStyleConfig = {
  baseStyle: {
    bg: "gray.500",
    color: "whiteAlpha.800",
    br: "4px",
    m: "5px",
    [$arrowBg.variable]: "colors.gray.500",
    filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
  },
  variants: {
    error: {
      fontSize: "12px",
      py: "10px",
      px: "40px",
      borderRadius: "4px",
      bgColor: "red.400",
      [$arrowBg.variable]: "colors.red.400",
    },
  },
};
