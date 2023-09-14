import { ComponentStyleConfig, defineStyleConfig } from "@chakra-ui/react";

export const Text: ComponentStyleConfig = defineStyleConfig({
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
});
