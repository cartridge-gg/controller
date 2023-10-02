import { modalAnatomy } from "@chakra-ui/anatomy";
import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(modalAnatomy.keys);

export const Modal: ComponentStyleConfig = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    dialog: {
      bg: "solid.bg",
    },
    closeButton: {
      color: "text.secondary",
      _focus: {
        boxShadow: "none",
      },
    },
  }),
});
