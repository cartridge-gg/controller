import type { ComponentStyleConfig } from "@chakra-ui/theme";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";

export const Input: ComponentStyleConfig = {
  variants: {
    primary: (props: StyleFunctionProps) => ({
      field: {
        h: "32px",
        border: "1px solid",
        fontSize: "14px",
        borderColor: "whiteAlpha.200",
        bgColor: "gray.700",
        _focus: {
          bgColor: "gray.600",
        },
        _hover: {
          bgColor: "gray.600",
        },
      },
    }),
    secondary: (props: StyleFunctionProps) => ({
      field: {
        borderRadius: "3px",
        background: "gray.700",
        color: "white",
      },
    }),
  },
  defaultProps: {
    variant: "primary",
  },
};
