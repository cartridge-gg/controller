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
  },
  defaultProps: {
    variant: "transparent",
  },
};
