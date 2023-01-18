import type { ComponentStyleConfig } from "@chakra-ui/theme";

export const Link: ComponentStyleConfig = {
  baseStyle: {
    _focus: {
      // TODO: handle accessibility properly
      boxShadow: "none",
    },
  },
  variants: {
    traditional: {
      textDecoration: "underline",
      color: "blue.400",
    },
    more: {
      textDecoration: "underline",
      color: "blue.500",
    },
    transparent: {
      textDecoration: "none !important",
    },
    outline: {
      paddingY: "3px",
      paddingX: "10px",
      border: "1px solid",
      borderColor: "gray.600",
      borderRadius: "5px",
      color: "blue.400",
    },
  },
  defaultProps: {
    variant: "transparent",
  },
};
