import type { ComponentMultiStyleConfig } from "@chakra-ui/theme";

export const Menu: ComponentMultiStyleConfig = {
  parts: ["button", "item", "list", "divider"],
  baseStyle: {
    button: {
      paddingX: "14px",
      paddingY: "6px",
      borderRadius: "full",
      background: "gray.700",
      _hover: {
        background: "gray.600",
      },
    },
    list: {
      py: "0",
      border: "0",
      overflow: "hidden",
      background: "gray.700",
    },
    item: {
      p: "11px",
      color: "gray.200",
      fontSize: "14px",
      fontWeight: "bold",
      letterSpacing: "0.02em",
      borderBottom: "1px solid",
      borderColor: "gray.900",
      transition: "color 0.2s ease",
    },
  },
};
