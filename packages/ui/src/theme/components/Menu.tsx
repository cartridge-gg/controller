import { createMultiStyleConfigHelpers } from "@chakra-ui/react";
import type { ComponentMultiStyleConfig } from "@chakra-ui/theme";

const helpers = createMultiStyleConfigHelpers([
  "menu",
  "item",
  "list",
  "divider",
]);

export const Menu: ComponentMultiStyleConfig = helpers.defineMultiStyleConfig({
  baseStyle: {
    button: {
      p: 2,
      borderRadius: 4,
      bg: "solid.primary",
      _hover: {
        bg: "solid.secondary",
      },
    },
    list: {
      py: 0,
      border: 0,
      overflow: "hidden",
    },
    item: {
      p: "11px",
      fontSize: "sm",
      fontWeight: "bold",
      letterSpacing: "0.02em",
      borderBottom: "1px solid",
      background: "solid.primary",
      transition: "color 0.2s ease",
    },
  },
  variants: {
    select: {
      menu: {
        button: {
          w: "full",
          fontSize: "14px",
          background: "none",
          borderRadius: "0",
          _hover: {
            background: "none",
          },
        },
        list: {
          borderRadius: "4px",
        },
        item: {
          color: "white",
          fontWeight: "normal",
        },
      },
    },
  },
});
