import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { colors, semanticColors } from "./colors";
import * as Components from "./components";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors,
  semanticTokens: {
    colors: semanticColors,
  },
  fonts: {
    body: "Inter",
  },
  styles: {
    global: {
      body: {
        background: "gray.800",
        WebkitTapHighlightColor: "transparent",
      },
    },
  },
  components: {
    ...Components,
  },
});

export default theme;
