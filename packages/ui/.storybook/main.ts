import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@chakra-ui/storybook-addon"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  features: {
    emotionAlias: false,
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ['../../keychain/public']
};
export default config;
