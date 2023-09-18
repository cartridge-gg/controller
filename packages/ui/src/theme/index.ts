export * from "./Provider";

import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { colors, semanticColors } from "./colors";
import { fonts } from "./fonts";
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
  fonts,
  styles: {
    global: {
      body: {
        color: "text.primary",
        background: "translucent.lg",
        WebkitTapHighlightColor: "transparent",
      },
    },
  },
  components: {
    ...Components,
  },
});

export default theme;
