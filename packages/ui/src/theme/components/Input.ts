import { ComponentStyleConfig, defineStyleConfig } from "@chakra-ui/react";

export const Input: ComponentStyleConfig = defineStyleConfig({
  defaultProps: {
    variant: "filled",
    // @ts-expect-error TODO: Seems style theme props only
    focusBorderColor: "solid.accent",
    errorBorderColor: "alert.foreground",
  },
  sizes: {
    md: {
      field: {
        height: 12,
      },
    },
  },
  variants: {
    filled: {
      field: {
        bg: "solid.primary",
        color: "text.primary",
        borderWidth: 1,
        borderColor: "solid.secondary",
        _hover: {
          borderColor: "solid.accent",
        },
        _focus: {
          bg: "solid.secondary",
          borderColor: "solid.accent",
        },
        // Workaround to set background color for autofill
        // ref: https://stackoverflow.com/a/71693606
        _autofill: {
          border: "1px solid var(--chakra-colors-solid-accent)",
          textFillColor: "text.primary",
          boxShadow: "0 0 0px 1000px var(--chakra-colors-solid-primary) inset",
          transition: "background-color 5000s ease-in-out 0s",
        },
      },
    },
  },
});
