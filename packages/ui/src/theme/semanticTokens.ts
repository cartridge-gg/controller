export const semanticTokens = {
  fonts: {
    Inter: "var(--font-inter), system-ui, sans-serif",
    "IBM Plex Mono": "var(--font-ibm-plex-mono), ui-monospace, sans-serif",
  },
  colors: {
    text: {
      primary: {
        default: "white",
        _light: "black",
      },
      secondary: {
        default: "darkGray.200",
        _light: "blueGray.700",
      },
      secondaryAccent: {
        default: "darkGray.100",
        _light: "blueGray.800",
      },
      error: "red.400",
    },
    link: {
      blue: {
        default: "blue.200",
        _light: "blue.400",
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
      primaryForeground: {
        default: "darkGray.800",
        _light: "blueGray.100",
      },
      secondary: {
        default: "darkGray.600",
        _light: "blueGray.300",
      },
      tertiary: {
        default: "darkGray.500",
        _light: "blueGray.400",
      },
      accent: {
        default: "darkGray.400",
        _light: "blueGray.500",
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
  },
};
