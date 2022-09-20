import type { ComponentStyleConfig } from "@chakra-ui/theme";

export const Table: ComponentStyleConfig = {
  variants: {
    simple: {
      th: {
        borderColor: "gray.800",
        borderWidthBottom: "2px",
        color: "white",
      },
      td: {
        borderColor: "gray.800",
        borderWidthBottom: "2px",
        color: "white",
      },
    },
  },
};
