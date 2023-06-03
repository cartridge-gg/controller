import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import colors from "./colors";
import * as Components from "./components";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors,
  fonts: {
    heading: "LD_Mono",
    body: "IBM Plex Sans",
  },
  styles: {
    global: {
      body: {
        background: "legacy.gray.800",
        WebkitTapHighlightColor: "transparent",
      },
    },
  },
  components: {
    ...Components,
  },
});

export default theme;
