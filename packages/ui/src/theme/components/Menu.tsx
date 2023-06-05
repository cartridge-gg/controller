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
      paddingX: "14px",
      paddingY: "6px",
      borderRadius: "full",
      background: "legacy.gray.700",
      _hover: {
        background: "legacy.gray.600",
      },
    },
    list: {
      py: "0",
      border: "0",
      overflow: "hidden",
      background: "legacy.gray.700",
    },
    item: {
      p: "11px",
      color: "legacy.gray.200",
      fontSize: "14px",
      fontWeight: "bold",
      letterSpacing: "0.02em",
      borderBottom: "1px solid",
      borderColor: "legacy.gray.900",
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
