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
      pb: "0",
    },
    button: {
      p: 3,
      fontSize: "sm",
      height: "auto",
      paddingY: "12px",
      paddingX: "18px",
      borderRadius: "6px",
      // color: "text.primary",
      _expanded: {
        borderRadius: "6px 6px 0 0",
        cursor: "default",
        // bgColor: "solid.primary",
      },
      transition: "border-radius 0.2s ease",
      // bgColor: "solid.primary",
      _hover: {
        // bgColor: "solid.primary",
      },
    },
    panel: {
      fontSize: "xs",
      // color: "text.primary",
      // bgColor: "solid.primary",
    },
    icon: {
      // color: "text.primary",
    },
  }),
  variants: {
    info: {
      // button: {
      //   bgColor: "red.200",
      //   _expanded: {
      //     bgColor: "red.200",
      //   },
      //   _hover: {
      //     bgColor: "red.200",
      //   },
      // },
      // panel: {
      //   bgColor: "red.200",
      // },
    },
    warning: {
      button: {
        bgColor: "yellow.200",
        _expanded: {
          bgColor: "yellow.200",
        },
        _hover: {
          bgColor: "yellow.200",
        },
      },
      panel: {
        bgColor: "yellow.200",
      },
    },
    error: {
      button: {
        bgColor: "red.200",
        _expanded: {
          bgColor: "red.200",
        },
        _hover: {
          bgColor: "red.200",
        },
      },
      panel: {
        bgColor: "red.200",
      },
    },
  },
});
