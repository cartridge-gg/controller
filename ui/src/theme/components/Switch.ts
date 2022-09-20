import type { ComponentStyleConfig } from "@chakra-ui/theme";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";

export const Switch: ComponentStyleConfig = {
  variants: {
    default: (props: StyleFunctionProps) => ({
      track: {
        "--switch-track-width": "2.8rem",
        "--switch-track-height": "1.25rem",
        paddingLeft: "5px",
        borderRadius: "15px",
        background: "gray.700",
        width: "36px",
        height: "20px",
        "&:after": {
          content: `"OFF"`,
          position: "absolute",
          right: "6px",
          top: "12px",
          fontSize: "10px",
          fontFamily: "IBM Plex Sans",
          fontWeight: 700,
          color: "#4B4B4B",
        },
        "&[data-checked]": {
          background: "gray.700",
          "&:after": {
            content: `"ON"`,
            right: "22px",
            color: "yellow.400",
          },
        },
        "&[data-focus]": {
          boxShadow: "none",
        },
        "&[data-disabled]": {
          opacity: "1",
          width: "24px",
          bgColor: "gray.700",
          _after: {
            content: `"OFF"`,
            color: "gray.400",
          },
          span: {
            display: "none",
          },
        },
        "&[data-disabled][data-checked]": {
          opacity: "1",
          width: "24px",
          bgColor: "gray.700",
          _after: {
            content: `"ON"`,
            color: "gray.200",
            right: "9px",
          },
          span: {
            display: "none",
          },
        },
      },
      thumb: {
        width: "10px",
        height: "10px",
        marginTop: "5px",
        background: "#4B4B4B",
        "&[data-checked]": {
          background: "yellow.400",
          "--switch-thumb-x": "22px",
        },
      },
    }),
  },
  defaultProps: {
    variant: "default",
  },
};
