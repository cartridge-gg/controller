import { ComponentStyleConfig, defineStyleConfig } from "@chakra-ui/react";

export const Select: ComponentStyleConfig = defineStyleConfig({
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
});
