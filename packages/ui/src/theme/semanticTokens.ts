export const semanticTokens = {
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
      success: "green.400",
      error: "red.400",
    },
    link: {
      blue: {
        default: "#73C4FF",
        _light: "#007FDB",
      },
    },
    brand: {
      primary: {
        default: "#FBCB4A",
        _light: "#7954E4",
      },
      secondary: {
        default: "#DEAE2B",
        _light: "#5F41B4",
      },
      muted: {
        default: "#85702D",
        _light: "#AC8FFF",
      },
      accent: {
        default: "green.200",
        _light: "#7954E4",
      },
      // Nested sematic color doesn't seem to work
      accentHighlight: {
        default: "green.100",
        _light: "#AC8FFF",
      },
      colorGradient: {
        default: "#FBCB4A",
        _light: "#AC8FFF",
      },
    },
    info: {
      background: "#95c1ea",
      foreground: "#005299",
    },
    warning: {
      foreground: "#fac400",
    },
    error: {
      background: "#f9b9b9",
      foreground: "#e66565",
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
        default: "darkGray.400",
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
