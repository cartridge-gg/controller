export * from "./Provider";

import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { colors } from "./colors";
import { fonts } from "./fonts";
import { semanticTokens } from "./semanticTokens";
import * as Components from "./components";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  fonts,
  styles: {
    global: {
      body: {
        color: "text.primary",
        background: "",
        WebkitTapHighlightColor: "transparent",
      },
    },
  },
  components: {
    ...Components,
  },
});

export default theme;
