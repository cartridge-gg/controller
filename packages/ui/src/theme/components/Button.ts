import {
  defineStyleConfig,
  StyleFunctionProps,
  ComponentStyleConfig,
} from "@chakra-ui/react";

export const Button: ComponentStyleConfig = defineStyleConfig({
  defaultProps: {
    variant: "solid",
  },
  baseStyle: {
    outline: "none",
    borderRadius: "base",
    fontFamily: '"IBM Plex Mono", ui-monospace, sans-serif',
    fontWeight: "semibold",
    ":hover:disabled": {
      cursor: "not-allowed",
    },
    lineHeight: "none",
    textTransform: "uppercase",
    _disabled: {
      pointerEvents: "none",
    },
  },
  sizes: {
    xs: {
      px: 2,
      py: 3,
      h: 8,
    },
    sm: (p) =>
      p.rightIcon
        ? {
            h: 9,
            p: 2,
            pl: 4,
          }
        : {
            h: 9,
            px: 4,
            py: 2,
          },
    md: {
      px: 6,
      py: 2.5,
    },
    lg: {
      px: 6,
      py: 3.5,
    },
  },
  variants: {
    solid: getColorProps,
    round: (p) => ({
      ...getColorProps(p),
      borderRadius: "full",
    }),
    link: {
      color: "link.blue",
      borderColor: "solid.secondary",
      borderWidth: 1,
      p: "4px 16px",
      fontSize: "xs",
      fontFamily: "Inter",
      fontWeight: "normal",
      textTransform: "capitalize",
      _hover: {
        bg: "solid.secondary",
        textDecor: "none",
      },
    },
  },
});

function getColorProps({ colorScheme }: StyleFunctionProps) {
  switch (colorScheme as ButtonColorScheme) {
    case "colorful":
      return {
        color: "brand.primaryForeground",
        bg: "brand.primary",
        _hover: {
          opacity: 0.8,
        },
        _disabled: {
          opacity: 0.5,
        },
      };
    case "translucent":
      return {
        color: "text.primary",
        bg: "translucent.soft",
        _hover: {
          bg: "translucent.md",
        },
      };
    case "solid":
      return {
        color: "text.primary",
        bg: "solid.primary",
        _hover: {
          bg: "solid.secondary",
        },
        _disabled: {
          opacity: 0.25,
        },
      };
  }
}

export type ButtonColorScheme = "colorful" | "translucent" | "solid";
