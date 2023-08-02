export const colors = {
  transparent: "transparent",
  white: "#FFF",
  black: "#000",
  red: "#E15B49",
  yellow: {
    200: "#FDE092",
    400: "#FBCB4A",
    600: "#DEAE2B",
    800: "#85702D",
  },
  purple: {
    200: "#AC8FFF",
    400: "#7954E4",
    600: "#5F41B4",
  },
  green: {
    100: "#CAF1CA",
    200: "#A7E7A7",
    400: "#0EAD69",
  },
  darkGray: {
    100: "#9C9C9C",
    200: "#808080",
    300: "#484D49",
    400: "#373C38",
    500: "#2A2F2A",
    600: "#242824",
    700: "#1E221F",
    800: "#161A17",
    900: "#0F1410",
  },
  blueGray: {
    100: "#FBFCFE",
    200: "#ECEFF2",
    300: "#E2E5E9",
    400: "#D4DADF",
    500: "#BEC5CB",
    600: "#9EA7B0",
    800: "#43464D",
    900: "#2F3136",
  },
  opacityWhite: {
    100: "rgba(255, 255, 255, 0.04)",
    200: "rgba(255, 255, 255, 0.08)",
    300: "rgba(255, 255, 255, 0.12)",
    400: "rgba(255, 255, 255, 0.16)",
    500: "rgba(255, 255, 255, 0.24)",
    600: "rgba(255, 255, 255, 0.32)",
    700: "rgba(255, 255, 255, 0.48)",
    800: "rgba(255, 255, 255, 0.64)",
    900: "rgba(255, 255, 255, 0.8)",
  },
  opacityBlack: {
    100: "rgba(0, 0, 0, 0.04)",
    200: "rgba(0, 0, 0, 0.08)",
    300: "rgba(0, 0, 0, 0.12)",
    400: "rgba(0, 0, 0, 0.16)",
    500: "rgba(0, 0, 0, 0.24)",
    600: "rgba(0, 0, 0, 0.32)",
    700: "rgba(0, 0, 0, 0.48)",
    800: "rgba(0, 0, 0, 0.64)",
    900: "rgba(0, 0, 0, 0.80)",
  },
};

export const semanticColors = {
  text: {
    primary: {
      default: "white",
      _light: "black",
    },
    secondary: {
      default: "darkGray.200",
      _light: "blueGray.700",

      accent: {
        default: "darkGray.100",
        _light: "blueGray.800",
      },
    },
    error: {
      default: "white",
      _light: "white",
    },
  },
  brand: {
    primary: {
      default: "yellow.400",
      _light: "purple.400",
    },
    secondary: {
      default: "yellow.600",
      _light: "purple.600",
    },
    muted: {
      default: "yellow.800",
      _light: "purple.200",
    },
    accent: {
      default: "green.200",
      _light: "purple.400",
    },
    // Nested sematic color doesn't seem to work
    accentHighlight: {
      default: "green.100",
      _light: "purple.200",
    },
    colorGradient: {
      default: "yellow.400",
      _light: "purple.200",
    },
  },
  solid: {
    bg: {
      default: "darkGray.800",
      _light: "blueGray.100",
    },
    primary: {
      default: "darkGray.700",
      _light: "blueGray.200",
    },
    secondary: {
      default: "darkGray.600",
      _light: "blueGray.300",
    },
    accent: {
      default: "darkGray.500",
      _light: "blueGray.400",
    },
    spacer: {
      default: "darkGray.900",
      _light: "blueGray.200",
    },
  },
  translucent: {
    soft: {
      default: "opacityWhite.200",
      _light: "opacityBlack.200",
    },
    md: {
      default: "opacityWhite.300",
      _light: "opacityBlack.300",
    },
    lg: {
      default: "opacityWhite.600",
      _light: "opacityBlack.600",
    },
    heavy: {
      default: "opacityWhite.800",
      _light: "opacityBlack.800",
    },
  },
};
