import type { ComponentStyleConfig } from "@chakra-ui/theme";

export const Select: ComponentStyleConfig = {
  baseStyle: {},
  variants: {
    primary: {
      field: {
        fontSize: "14Px",
        borderRadius: "3px",
        background: "gray.700",
      },
    },
  },
  defaultProps: {
    variant: "primary",
  },
};
