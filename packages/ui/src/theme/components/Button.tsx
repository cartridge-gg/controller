import { StyleFunctionProps } from "@chakra-ui/theme-tools";
import type { ComponentStyleConfig } from "@chakra-ui/theme";
import { Button as ChakraButton, defineStyleConfig } from "@chakra-ui/react";
import { Loading } from "../../components/Loading";

const legacyBase = {
  fontSize: "xs",
  fontFamily: "LD_Mono",
  border: "1px solid",
  fontWeight: "normal",
  letterSpacing: "0.1em",
};

export const Button: ComponentStyleConfig = defineStyleConfig({
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
      opacity: "1",
      pointerEvents: "none",
    },
    _focus: {
      // TODO: handle accessibility properly
      boxShadow: "none",
    },
  },
  sizes: {
    sm: (p) =>
      p.variant === "form"
        ? {
            h: 10,
            px: 6,
            py: 3,
          }
        : p.rightIcon
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
      py: 3.5,
    },
  },
  defaultProps: {
    variant: "legacyPrimary",
    colorScheme: "legacy.yellow",
    size: "sm",
  },
  variants: {
    // New design system ↓: https://www.figma.com/file/6ZQgwNrqpRlMg9GFbA41dv/Components?type=design&node-id=211-7721&t=42rebNqIXfsvMo4z-0
    form: getColorStyle,
    label: (p) => ({
      fontFamily: "Inter",
      textTransform: "capitalize",
      letterSpacing: "normal",
      ...getColorStyle(p),
    }),
    labelRounded: (p) => ({
      fontFamily: "Inter",
      textTransform: "capitalize",
      letterSpacing: "normal",
      borderRadius: "full",
      ...getColorStyle(p),
    }),
    // Legacy
    legacyPrimary: (props: StyleFunctionProps) => ({
      ...legacyBase,
      color:
        props.colorTheme === "red" ||
        props.colorScheme === "purple" ||
        props.colorScheme === "darkPurple"
          ? "white"
          : "legacy.gray.900",
      background: `legacy.${props.colorScheme}.400`,
      _hover: {
        background: `legacy.${props.colorScheme}.200`,
      },
      ":hover:disabled": {
        background: `legacy.${props.colorScheme}.800`,
      },
      _disabled: {
        background: `legacy.${props.colorScheme}.800`,
      },
      _active: {
        background: `legacy.${props.colorScheme}.400`,
      },
    }),
    legacyPrimary400: (props: StyleFunctionProps) => ({
      ...legacyBase,
      color:
        props.colorTheme === "red" ||
        props.colorScheme === "purple" ||
        props.colorScheme === "darkPurple"
          ? "white"
          : "legacy.gray.900",
      background: `${props.colorScheme}.400`,
      _hover: {
        background: `${props.colorScheme}.300`,
      },
      ":hover:disabled": {
        background: `${props.colorScheme}.800`,
      },
      _disabled: {
        background: `${props.colorScheme}.800`,
      },
      _active: {
        background: `${props.colorScheme}.400`,
      },
    }),
    legacyPrimaryDarken: (props: StyleFunctionProps) => ({
      ...legacyBase,
      color:
        props.colorTheme === "red" ||
        props.colorScheme === "purple" ||
        props.colorScheme === "darkPurple"
          ? "white"
          : "legacy.gray.900",
      background: `${props.colorScheme}.200`,
      _hover: {
        background: `${props.colorScheme}.400`,
      },
      ":hover:disabled": {
        background: `${props.colorScheme}.800`,
      },
      _disabled: {
        background: `${props.colorScheme}.800`,
      },
      _active: {
        background: `${props.colorScheme}.400`,
      },
    }),
    legacySpecial: {
      ...legacyBase,
      fontSize: "13px",
      color: "brand",
      border: "1px",
      borderColor: "legacy.gray.800",
      background: "legacy.gray.800",
      paddingX: "15px",
      _hover: {
        border: "1px",
        borderColor: "legacy.gray.600",
        background: "legacy.gray.700",
      },
    },
    legacyDark: {
      ...legacyBase,
      color: "legacy.gray.200",
      border: "1px solid",
      borderColor: "legacy.gray.700",
      _hover: {
        borderColor: "legacy.gray.700",
        backgroundColor: "legacy.gray.700",
        color: "white",
      },
      ":hover:disabled": {
        background: "legacy.gray.500",
      },
      _disabled: {
        background: "legacy.gray.500",
      },
    },
    legacyAccent: {
      ...legacyBase,
      color: "brand",
      background: "legacy.gray.600",
      _hover: {
        background: "legacy.gray.500",
      },
      ":hover:disabled": {
        background: "legacy.gray.500",
      },
      _disabled: {
        background: "legacy.gray.500",
      },
    },
    legacySecondary450: {
      ...legacyBase,
      color: "white",
      background: "legacy.gray.450",
      _hover: {
        background: "legacy.gray.400",
      },
      _disabled: {
        color: "legacy.gray.200",
        background: "legacy.gray.450",
      },
      _active: {
        background: "legacy.gray.450",
      },
    },
    legacySecondary600: {
      ...legacyBase,
      color: "white",
      background: "legacy.gray.600",
      _hover: {
        background: "legacy.gray.400",
      },
      _disabled: {
        color: "legacy.gray.200",
        background: "legacy.gray.600",
      },
      _active: {
        background: "legacy.gray.600",
      },
    },
    legacySecondary700: {
      ...legacyBase,
      color: "white",
      background: "legacy.gray.700",
      _hover: {
        background: "legacy.gray.600",
      },
      _disabled: {
        color: "legacy.gray.200",
        background: "legacy.gray.700",
      },
      _active: {
        background: "legacy.gray.700",
      },
    },
  },
});

function getColorStyle({ colorScheme }: StyleFunctionProps) {
  switch (colorScheme) {
    case "yellow":
    default: {
      return {
        color: "black",
        bg: "yellow.400",
        _hover: {
          bg: "yellow.600",
        },
        _disabled: {
          color: "blackAlpha.700",
          bg: "yellow.800",
        },
      };
    }
    case "purple": {
      return {
        color: "white",
        bg: "purple.400",
        _hover: {
          bg: "purple.900",
        },
        _disabled: {
          color: "whiteAlpha.700",
          bg: "purple.100",
        },
      };
    }
    case "darkGray": {
      return {
        color: "white",
        bg: "darkGray.700",
        _hover: {
          bg: "darkGray.600",
        },
        _disabled: {
          color: "whiteAlpha.700",
          bg: "darkGray.500",
        },
      };
    }
    case "blueGray": {
      return {
        color: "black",
        bg: "blueGray.200",
        _hover: {
          bg: "blueGray.300",
        },
        _disabled: {
          color: "blackAlpha.700",
          bg: "blueGray.200",
        },
      };
    }
    case "whiteAlpha": {
      return {
        color: "white",
        bg: "whiteAlpha.300",
        _hover: {
          bg: "whiteAlpha.400",
        },
        _disabled: {
          color: "whiteAlpha.700",
          bg: "whiteAlpha.100",
        },
      };
    }
    case "blackAlpha": {
      return {
        color: "black",
        bg: "blackAlpha.200",
        _hover: {
          bg: "blackAlpha.300",
        },
        _disabled: {
          color: "blackAlpha.700",
          bg: "blackAlpha.100",
        },
      };
    }
  }
}

ChakraButton.defaultProps = {
  ...ChakraButton.defaultProps,
  // TODO: Swap to "fill" once all components are migrated to new design system
  variant: "legacyPrimary",
  // TODO: Swap to "yello" once all components are migrated to new design system
  colorScheme: "legacy.yellow",
  spinner: <Loading />,
};
