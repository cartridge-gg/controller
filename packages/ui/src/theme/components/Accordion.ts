import { accordionAnatomy } from "@chakra-ui/anatomy";
import {
  ComponentStyleConfig,
  createMultiStyleConfigHelpers,
} from "@chakra-ui/react";

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(accordionAnatomy.keys);

export const Accordion: ComponentStyleConfig = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    container: {
      color: "text.primary",
      bg: "solid.primary",
      borderColor: "solid.bg",
      pb: 0,
      borderRadius: "6px",
    },
    button: {
      p: 3,
      fontSize: "sm",
      height: "auto",
      paddingY: "12px",
      paddingX: "18px",
      _expanded: {
        borderRadius: "6px 6px 0 0",
        cursor: "default",
        _hover: {
          bg: "solid.primary",
        },
      },
    },
    panel: {
      fontSize: "xs",
      p: 0,
    },
    icon: {},
  }),
  variants: {
    info: {
      container: {
        color: "black",
        bg: "info.background",
      },
      button: {
        _expanded: {
          _hover: {
            bg: "info.background",
          },
        },
      },
    },
    warning: {
      container: {
        bg: "solid.tertiary",
      },
      button: {
        _expanded: {
          _hover: {
            bg: "solid.tertiary",
          },
        },
      },
    },
    error: {
      container: {
        color: "black",
        bg: "error.background",
      },
      button: {
        _expanded: {
          _hover: {
            bg: "error.background",
          },
        },
      },
    },
  },
});
