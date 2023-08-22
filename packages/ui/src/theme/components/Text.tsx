import type { ComponentStyleConfig } from "@chakra-ui/theme";

export const Text: ComponentStyleConfig = {
  baseStyle: {
    color: "text.primary",
    bg: "transparent",
  },
  variants: {
    "ld-mono-upper": {
      fontFamily: "LD_Mono",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
  },
};
