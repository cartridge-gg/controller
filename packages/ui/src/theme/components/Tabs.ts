import { tabsAnatomy } from "@chakra-ui/anatomy";
import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

export const Tabs: ComponentStyleConfig = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    tablist: {
      borderBottomWidth: 1,
      borderBottomColor: "solid.secondary",
    },
    tab: {
      bg: "solid.bg",
      _selected: {
        color: "brand.primary",
      },
    },
  }),
});
