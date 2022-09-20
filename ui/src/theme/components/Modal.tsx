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
      background: "gray.700",
      pt: "42px",
    },
    closeButton: {
      color: "gray.400",
      _focus: {
        boxShadow: "none",
      },
    },
    body: {
      pb: "12px",
    },
    footer: {
      pt: "0",
      pb: "24px",
    },
  },
};
