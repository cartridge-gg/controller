import { ComponentStyleConfig, defineStyleConfig } from "@chakra-ui/react";

export const Heading: ComponentStyleConfig = defineStyleConfig({
  baseStyle: {
    color: "text.primary",
    bg: "transparent",
  },
  variants: {
    section: {
      textTransform: "uppercase",
      color: "translucent.lg",
      fontSize: "xs",
      fontWeight: "bold",
    },
  },
});
