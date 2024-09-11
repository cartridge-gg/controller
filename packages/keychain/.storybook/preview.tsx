import React from "react";
import { PropsWithChildren } from "react";
import type { Preview } from "@storybook/react";
import {
  ControllerThemeProvider,
  useChakraTheme,
  useControllerThemePreset,
} from "../src/hooks/theme";
import { ChakraProvider } from "@chakra-ui/react";
import { ControllerTheme } from "@cartridge/controller";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <Provider>
        <Story />
      </Provider>
    ),
  ],
};

function Provider({ children }: PropsWithChildren) {
  const preset = useControllerThemePreset();
  const chakraTheme = useChakraTheme(preset);
  const ctrlTheme: ControllerTheme = {
    id: preset.id,
    name: preset.name,
    icon: preset.icon,
    cover: preset.cover,
    colorMode: "dark",
  };

  return (
    <ChakraProvider theme={chakraTheme}>
      <ControllerThemeProvider value={ctrlTheme}>
        {children}
      </ControllerThemeProvider>
    </ChakraProvider>
  );
}

export default preview;
