import { menuAnatomy } from "@chakra-ui/anatomy";
import {
  ComponentStyleConfig,
  MenuItem,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

export const Menu: ComponentStyleConfig = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    button: {
      p: 2,
      borderRadius: "md",
      _hover: {
        bg: "solid.secondary",
      },
    },
    list: {
      bg: "solid.primary",
      borderWidth: 0,
    },
    item: {
      color: "text.secondary",
      bg: "solid.primary",
      _hover: {
        bg: "solid.secondary",
        color: "text.primary",
      },
    },
  }),
});

MenuItem.defaultProps = {
  iconSpacing: 1,
};
