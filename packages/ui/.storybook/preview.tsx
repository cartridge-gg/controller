import React, { useEffect } from "react";
import { Preview } from "@storybook/react";
import { CartridgeUIProvider } from "../src/theme";
import { useColorMode } from "@chakra-ui/react";
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
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#161A17" }, // should match to "solid.bg"
        { name: "light", value: "#FBFCFE" },
      ],
    },
  },
  decorators: [
    (Story) => (
      <CartridgeUIProvider>
        <ColorModeProvider>
          <Story />
        </ColorModeProvider>
      </CartridgeUIProvider>
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
