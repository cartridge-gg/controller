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
      background: "legacy.gray.800",
      pt: "42px",
    },
    closeButton: {
      color: "legacy.gray.400",
      _focus: {
        boxShadow: "none",
      },
    },
    footer: {
      p: "16px",
    },
  },
};
