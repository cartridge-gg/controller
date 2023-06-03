import { StyleFunctionProps } from "@chakra-ui/theme-tools";
import type { ComponentStyleConfig } from "@chakra-ui/theme";
import { Button as ChakraButton, defineStyleConfig } from "@chakra-ui/react";
import { Loading } from "../../components/Loading";

const legacyBase = {
  fontSize: "xs",
  border: "1px solid",
}

// TODO: Rename to `FormButton` ?
export const Button: ComponentStyleConfig = defineStyleConfig({
  baseStyle: {
    fontSize: "sm",
    outline: "none",
    borderRadius: "4px",
    fontFamily: "LD_Mono",
    letterSpacing: "0.1em",
    ":hover:disabled": {
      cursor: "not-allowed",
    },
    _disabled: {
      opacity: "1",
      pointerEvents: "none",
    },
    _focus: {
      // TODO: handle accessibility properly
      boxShadow: "none",
    },
  },
  variants: {
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
    // New design system ↓: https://www.figma.com/file/6ZQgwNrqpRlMg9GFbA41dv/Components?type=design&node-id=211-7721&t=42rebNqIXfsvMo4z-0
    yellow: {
      color: "black",
      background: "yellow.400",
      _hover: {
        background: "yellow.600",
      },
      _disabled: {
        color: "blackAlpha.700",
        background: "yellow.800",
      },
    },
    purple: {
      color: "white",
      background: "yellow.400",
      _hover: {
        background: "yellow.600",
      },
      _disabled: {
        color: "whiteAlpha.700",
        background: "yellow.800",
      },
    },
    darkGray: {
      color: "white",
      background: "darkGray.700",
      _hover: {
        background: "darkGray.600",
      },
      _disabled: {
        color: "whiteAlpha.700",
        background: "darkGray.500",
      },
    },
    blueGray: {
      color: "black",
      background: "blueGray.200",
      _hover: {
        background: "blueGray.300",
      },
      _disabled: {
        color: "blackAlpha.700",
        background: "blueGray.200",
      },
    },
    whiteAlpha: {
      color: "white",
      background: "whiteAlpha.300",
      _hover: {
        background: "whiteAlpha.400",
      },
      _disabled: {
        color: "whiteAlpha.700",
        background: "whiteAlpha.100",
      },
    },
    blackAlpha: {
      color: "black",
      background: "blackAlpha.200",
      _hover: {
        background: "blackAlpha.300",
      },
      _disabled: {
        color: "blackAlpha.700",
        background: "blackAlpha.100",
      },
    },
  },
});

ChakraButton.defaultProps = {
  ...ChakraButton.defaultProps,
  // TODO: Swap to "yello" once all components are migrated to new design system
  variant: "legacyPrimary",
  colorScheme: "legacy.yellow",
  spinner: <Loading />,
};
