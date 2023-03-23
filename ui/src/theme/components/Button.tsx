import React from "react";
import { StyleFunctionProps } from "@chakra-ui/theme-tools";
import type { ComponentStyleConfig } from "@chakra-ui/theme";
import { Button as ChakraButton } from "@chakra-ui/react";

import { Loading } from "../../components/Loading";

export const Button: ComponentStyleConfig = {
  baseStyle: {
    fontFamily: "LD_Mono",
    letterSpacing: "0.1em",
    borderRadius: "4px",
    outline: "none",
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
    primary: (props: StyleFunctionProps) => ({
      fontSize: "12px",
      color:
        props.colorTheme === "red" ||
        props.colorScheme === "purple" ||
        props.colorScheme === "darkPurple"
          ? "white"
          : "gray.900",
      background: `${props.colorScheme}.400`,
      _hover: {
        background: `${props.colorScheme}.200`,
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
    primary400: (props: StyleFunctionProps) => ({
      fontSize: "12px",
      color:
        props.colorTheme === "red" ||
        props.colorScheme === "purple" ||
        props.colorScheme === "darkPurple"
          ? "white"
          : "gray.900",
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
    primaryDarken: (props: StyleFunctionProps) => ({
      fontSize: "12px",
      color:
        props.colorTheme === "red" ||
        props.colorScheme === "purple" ||
        props.colorScheme === "darkPurple"
          ? "white"
          : "gray.900",
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
    special: {
      fontSize: "13px",
      color: "brand",
      border: "1px",
      borderColor: "gray.800",
      background: "gray.800",
      paddingX: "15px",
      _hover: {
        border: "1px",
        borderColor: "gray.600",
        background: "gray.700",
      },
    },
    dark: {
      fontSize: "12px",
      color: "gray.200",
      border: "1px solid",
      borderColor: "gray.700",
      _hover: {
        borderColor: "gray.700",
        backgroundColor: "gray.700",
        color: "white",
      },
      ":hover:disabled": {
        cursor: "not-allowed",
        background: "gray.500",
      },
      _disabled: {
        background: "gray.500",
      },
    },
    accent: {
      fontSize: "12px",
      color: "brand",
      background: "gray.600",
      _hover: {
        background: "gray.500",
      },
      ":hover:disabled": {
        cursor: "not-allowed",
        background: "gray.500",
      },
      _disabled: {
        background: "gray.500",
      },
    },
    secondary450: {
      color: "white",
      fontSize: "12px",
      background: "gray.450",
      _hover: {
        background: "gray.400",
      },
      _disabled: {
        color: "gray.200",
        background: "gray.450",
      },
      _active: {
        background: "gray.450",
      },
    },
    secondary600: {
      color: "white",
      fontSize: "12px",
      background: "gray.600",
      _hover: {
        background: "gray.400",
      },
      _disabled: {
        color: "gray.200",
        background: "gray.600",
      },
      _active: {
        background: "gray.600",
      },
    },
    secondary700: {
      color: "white",
      fontSize: "12px",
      background: "gray.700",
      _hover: {
        background: "gray.600",
      },
      _disabled: {
        color: "gray.200",
        background: "gray.700",
      },
      _active: {
        background: "gray.700",
      },
    },
    secondary800: {
      color: "white",
      fontSize: "12px",
      background: "gray.800",
      _hover: {
        background: "gray.700",
      },
      _disabled: {
        color: "gray.200",
        background: "gray.800",
      },
      _active: {
        background: "gray.800",
      },
    },
  },
};

ChakraButton.defaultProps = {
  ...ChakraButton.defaultProps,
  colorScheme: "yellow",
  variant: "primary",
  spinner: <Loading />,
};
