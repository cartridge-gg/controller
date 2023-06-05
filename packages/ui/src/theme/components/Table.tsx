import type { ComponentStyleConfig } from "@chakra-ui/theme";

export const Table: ComponentStyleConfig = {
  variants: {
    simple: {
      th: {
        borderColor: "legacy.gray.800",
        borderWidthBottom: "2px",
        color: "white",
      },
      td: {
        borderColor: "legacy.gray.800",
        borderWidthBottom: "2px",
        color: "white",
      },
    },
  },
};
