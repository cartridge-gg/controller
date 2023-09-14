import {
  Button as ChakraButton,
  Spinner,
  defineStyleConfig,
  StyleFunctionProps,
} from "@chakra-ui/react";

// import { Loading } from "../../components/Loading";

export const Button = defineStyleConfig({
  defaultProps: {
    variant: "solid",
  },
  baseStyle: {
    outline: "none",
    borderRadius: "base",
    fontFamily: "'IBM Plex Mono'",
    fontWeight: "semibold",
    ":hover:disabled": {
      cursor: "not-allowed",
    },
    lineHeight: "none",
    textTransform: "uppercase",
    letterSpacing: "widest",
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
  switch (colorScheme as ColorScheme) {
    case "colorful":
      return {
        color: "solid.bg",
        bg: "brand.primary",
        _hover: {
          bg: "brand.secondary",
        },
        _disabled: {
          bg: "brand.muted",
          opacity: 0.5,
        },
      };
    case "translucent":
      return {
        color: "text.primary",
        bg: "tarnslucent.soft",
        _hover: {
          bg: "tarnslucent.medium",
        },
      };
    default:
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

type ColorScheme = "colorful" | "translucent" | "white";

ChakraButton.defaultProps = {
  // spinner: <Loading />,
  spinner: <Spinner />, // workaround for emotion css issue with typescript v5
};
