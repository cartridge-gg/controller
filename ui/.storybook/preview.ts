import type { Preview } from "@storybook/react";
import theme from "../src/theme"
import { ChakraProviderDecorator } from "@chakra-ui/storybook-addon/dist/feature/decorator/ChakraProviderDecorator";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    chakra: {
      theme,
    },
  },
  decorators: [
    ChakraProviderDecorator
  ],
};

export default preview;
