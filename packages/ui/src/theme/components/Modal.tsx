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
      background: "solid.bg",
      pt: "42px",
    },
    closeButton: {
      _focus: {
        boxShadow: "none",
      },
    },
    footer: {
      p: "16px",
    },
  }),
});
