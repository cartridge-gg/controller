import { modalAnatomy } from "@chakra-ui/anatomy";
import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";

const helpers = createMultiStyleConfigHelpers(modalAnatomy.keys);

export const Modal: ComponentStyleConfig = helpers.defineMultiStyleConfig({
  baseStyle: {
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
  },
});
