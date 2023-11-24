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
      _disabled: {
        _hover: {
          bg: "inherit",
          cursor: "default",
        },
      },
    },
    list: {
      bg: "solid.bg",
      borderWidth: 0,
      p: 1,
      gap: 1,
    },
    item: {
      color: "text.secondary",
      bg: "solid.bg",
      p: 2,
      _notLast: {
        borderBottomWidth: 1,
        borderColor: "solid.secondary",
      },
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
