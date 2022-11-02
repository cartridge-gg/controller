import type { ComponentStyleConfig } from "@chakra-ui/theme";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";

export const Switch: ComponentStyleConfig = {
  variants: {
    default: (props: StyleFunctionProps) => ({
      track: {
        paddingLeft: "5px",
        borderRadius: "15px",
        width: "36px",
        height: "18px",
        "&[data-checked]": {
          background: "#86CA9B",
        },
        "&[data-focus]": {
          boxShadow: "none",
        },
      },
      thumb: {
        boxSize: "14px",
        marginTop: "2px",
        background: "#4B4B4B",
        "&[data-checked]": {
          background: "#518A63",
          "--switch-thumb-x": "20px",
        },
      },
    }),
  },
  defaultProps: {
    variant: "default",
  },
};
