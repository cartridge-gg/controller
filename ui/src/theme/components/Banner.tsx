import type { ComponentStyleConfig } from "@chakra-ui/theme";

export const Banner: ComponentStyleConfig = {
  baseStyle: {
    background: "none",
  },
  variants: {
    outline: {
      border: "3px solid #333",
      background: "yellow.400",
    },
  },
};
