import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";

const helpers = createMultiStyleConfigHelpers([
  "overlay",
  "dialogContainer",
  "dialog",
  "header",
  "closeButton",
  "body",
  "footer",
]);

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
