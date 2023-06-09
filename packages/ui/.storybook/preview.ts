import type { Preview } from "@storybook/react";
import theme from "../src/theme"
import { ChakraProviderDecorator } from "@chakra-ui/storybook-addon/dist/feature/decorator/ChakraProviderDecorator";

import '../../keychain/src/style.css';

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
  // Workaround: https://github.com/chakra-ui/chakra-ui/issues/6338
  decorators: [
    ChakraProviderDecorator
  ],
};

export default preview;
