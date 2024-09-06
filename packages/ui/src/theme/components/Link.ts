import { ComponentStyleConfig, defineStyleConfig } from "@chakra-ui/react";

export const Link: ComponentStyleConfig = defineStyleConfig({
  baseStyle: {
    _focus: {
      // TODO: handle accessibility properly
      boxShadow: "none",
    },
  },
});
