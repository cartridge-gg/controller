import { inputAnatomy } from "@chakra-ui/anatomy";
import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

export const Input: ComponentStyleConfig = defineMultiStyleConfig({
  defaultProps: {
    variant: "filled",
  },
  sizes: {
    md: {
      field: {
        height: 12,
      },
    },
  },
  variants: {
    filled: definePartsStyle({
      field: {
        bg: "solid.primary",
        color: "text.primary",
        borderWidth: 1,
        borderColor: "solid.secondary",
        _focus: {
          borderColor: "solid.secondary",
        },
      },
    }),
  },
});
