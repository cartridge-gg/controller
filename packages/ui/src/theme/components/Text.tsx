import type { ComponentStyleConfig } from "@chakra-ui/theme";

export const Text: ComponentStyleConfig = {
  baseStyle: {
    color: "text.primary",
  },
  variants: {
    "ld-mono-upper": {
      fontFamily: "LD_Mono",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    "ibm-upper-bold": {
      fontFamily: "IBM Plex Sans",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
  },
};
