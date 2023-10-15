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
    table: {
      borderCollapse: "separate",
      borderSpacing: "0 0.5rem",
    },
    tbody: {
      bg: "solid.primary",
      fontSize: "sm",
      tr: {
        _hover: {
          bg: "solid.secondary",
          cursor: "pointer",
        },
        td: {
          _first: {
            borderLeftRadius: "md",
          },
          _last: {
            borderRightRadius: "md",
          },
        },
      },
    },
  }),
});

// Workarounds
Th.defaultProps = {
  color: "translucent.lg",
  borderBottomColor: "solid.bg",
  py: 3,
  px: 4,
};

Td.defaultProps = {
  borderBottomColor: "solid.bg",
  borderBottomWidth: 0,
  marginBottom: 8,
  py: 3,
  px: 4,
};
