import type { ComponentMultiStyleConfig } from "@chakra-ui/theme";

export const Drawer: ComponentMultiStyleConfig = {
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
      bgColor: "legacy.gray.800",
    },
  },
};
