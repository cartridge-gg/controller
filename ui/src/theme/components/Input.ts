import type { ComponentStyleConfig } from "@chakra-ui/theme";
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools";

export const Input: ComponentStyleConfig = {
  variants: {
    primary: (props: StyleFunctionProps) => ({
      field: {
        h: "32px",
        border: "1px solid",
        fontSize: "14px",
        borderColor: "legacy.whiteAlpha.200",
        bgColor: "legacy.gray.700",
        _focus: {
          bgColor: "legacy.gray.600",
        },
        _hover: {
          bgColor: "legacy.gray.600",
        },
      },
    }),
    secondary: (props: StyleFunctionProps) => ({
      field: {
        borderRadius: "3px",
        background: "legacy.gray.700",
        color: "white",
      },
    }),
  },
  defaultProps: {
    variant: "primary",
  },
};
