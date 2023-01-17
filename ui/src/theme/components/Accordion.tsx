import type { ComponentMultiStyleConfig } from "@chakra-ui/theme";

export const Accordion: ComponentMultiStyleConfig = {
  parts: ["root", "container", "button", "panel", "icon"],
  baseStyle: {
    container: {
      border: "0",
      pb: "10px",
    },
    panel: {
      padding: "12px",
      bgColor: "gray.800",
      borderRadius: "3px",
    },
    button: {
      paddingX: "24px",
      h: "50px",
      bgColor: "gray.700",
      borderRadius: "3px",
      _hover: {
        bgColor: "gray.600",
      },
      _expanded: {
        bgColor: "gray.600",
      },
      _focus: {
        // TODO: handle accessibility properly
        boxShadow: "none",
      },
    },
  },
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
      },
    },
  },
};
