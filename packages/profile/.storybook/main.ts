import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return path.dirname(require.resolve(path.join(value, "package.json")));
}

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-themes"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  viteFinal: (config) => 
    mergeConfig(config, {
      resolve: {
        alias: {
          "@/hooks/account": require.resolve("../src/hooks/account.mock.ts"),
        },
      },
    })
};
export default config;
