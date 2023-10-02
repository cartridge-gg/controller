import { tableAnatomy } from "@chakra-ui/anatomy";
import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
  Td,
  Th,
} from "@chakra-ui/react";

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(tableAnatomy.keys);

export const Table: ComponentStyleConfig = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    thead: { h: 20 },
    th: { p: 3 },
    tbody: { bg: "solid.primary", fontSize: "sm" },
  }),
});

// Workarounds
Th.defaultProps = {
  color: "translucent.lg",
  borderBottomColor: "solid.bg",
};

Td.defaultProps = {
  borderBottomColor: "solid.bg",
};
