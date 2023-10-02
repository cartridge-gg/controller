import { defineStyleConfig, ComponentStyleConfig } from "@chakra-ui/react";

export const Badge: ComponentStyleConfig = defineStyleConfig({
  baseStyle: {
    px: 2,
    py: 1,
    bg: "translucent.soft",
    color: "text.primary",
  },
  variants: {
    tab: {
      bg: "brand.primary",
      color: "solid.bg",
      borderRadius: "full",
      lineHeight: 1,
    },
  },
});
