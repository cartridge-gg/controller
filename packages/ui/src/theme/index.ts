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
    heading: "LD_Mono", // TODO: Where is it used?
    body: "Inter",
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
