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
      bg: "solid.primary",
      borderColor: "solid.bg",
    },
    panel: {
      fontSize: "xs",
      color: "text.secondary",
    },
    button: {
      p: 3,
      fontSize: "sm",
    },
    icon: {
      color: "text.secondary",
    },
  }),
  variants: {
    access: {},
    inventory: {},
    tokens: {},
    bridge: {
      container: {
        pb: "0",
        mt: "1px",
      },
      panel: {
        bgColor: "gray.700",
        padding: "0 16px 16px 16px",
        borderRadius: "0",
      },
      button: {
        paddingX: "16px",
        borderRadius: "0",
        bgColor: "gray.700",
        _expanded: {
          bgColor: "gray.700",
        },
        _disabled: {
          opacity: "1",
          bgColor: "gray.700",
          cursor: "auto",
        },
      },
    },
    error: {
      container: {
        pb: "0",
      },
      button: {
        height: "auto",
        paddingY: "12px",
        paddingX: "18px",
        bgColor: "red.200",
        borderRadius: "6px",
        _expanded: {
          bgColor: "red.200",
          borderRadius: "6px 6px 0 0",
        },
        _hover: {
          bgColor: "red.200",
        },
        transition: "border-radius 0.2s ease",
      },
      panel: {
        padding: "12px 18px 12px 18px",
        bgColor: "red.200",
        borderRadius: "0 0 6px 6px",
        overflowX: "auto",
      },
    },
  },
});
