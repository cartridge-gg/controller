import type { ComponentMultiStyleConfig } from "@chakra-ui/theme";

export const Modal: ComponentMultiStyleConfig = {
  parts: [
    "overlay",
    "dialogContainer",
    "dialog",
    "header",
    "closeButton",
    "body",
    "footer",
  ],
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
};
