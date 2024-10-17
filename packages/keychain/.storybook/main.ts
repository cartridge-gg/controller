import type { StorybookConfig } from "@storybook/nextjs";
import { join, dirname, resolve } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {},
  },
  webpackFinal: (config) => {
    // config.output = {
    //   ...config.output,
    //   webassemblyModuleFilename: "../static/wasm/webauthn.wasm",
    // };
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    config.resolve = {
      ...config.resolve,
      alias: {
        react: resolve("node_modules/react"),
      },
    };
    return config;
  },
  staticDirs: ["../public"],
};
export default config;
