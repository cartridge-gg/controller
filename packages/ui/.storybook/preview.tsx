import React, { useEffect } from "react";
import { Preview } from "@storybook/react";
import theme from "../src/theme";
import { ChakraProvider, useColorMode } from "@chakra-ui/react";
import { useDarkMode } from "storybook-dark-mode";

import "../../keychain/src/style.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    darkMode: {
      current: "dark",
    },
  },
  decorators: [
    (Story) => (
      <ChakraProvider theme={theme}>
        <ColorModeProvider>
          <Story />
        </ColorModeProvider>
      </ChakraProvider>
    ),
  ],
};

function ColorModeProvider({ children }) {
  const { setColorMode } = useColorMode();
  const isDarkMode = useDarkMode();

  useEffect(() => {
    setColorMode(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return <>{children}</>;
}

export default preview;
