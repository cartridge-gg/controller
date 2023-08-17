import { ComponentStyleConfig } from "@chakra-ui/react";

export const Input: ComponentStyleConfig = {
  defaultProps: {
    variant: "filled",
    focusBorderColor: "solid.accent",
    errorBorderColor: "red.500",
  },
  sizes: {
    md: {
      field: {
        height: 12,
      },
    },
  },
  variants: {
    filled: {
      field: {
        bg: "solid.primary",
        color: "text.primary",
        borderWidth: 1,
        borderColor: "solid.secondary",
        _hover: {
          borderColor: "solid.accent",
        },
        _focus: {
          bg: "solid.secondary",
          borderColor: "solid.accent",
        },
      },
    },
  },
};
