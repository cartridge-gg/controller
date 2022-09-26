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
    icon: {
      _hover: {
        transform: "rotate(-90deg)"
      },
      _expanded: {
        transform: "rotate(90deg)"
      }
    }
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
        borderRadius: "0"
      },
      button: {
        borderRadius: "0px",
        bgColor: "gray.800",
        _expanded: {
          bgColor: "gray.800"
        }
      }
    }
  },
};
