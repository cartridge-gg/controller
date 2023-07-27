import { ChakraProviderDecorator } from "@chakra-ui/storybook-addon/dist/ChakraProviderDecorator";
import { Preview } from "@storybook/react"
import theme from "../src/theme"

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
    // @ts-expect-error Workaround: https://github.com/chakra-ui/chakra-ui/issues/6338
    ChakraProviderDecorator
  ],
};

export default preview;
