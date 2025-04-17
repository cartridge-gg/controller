import type { StorybookConfig } from "@storybook/react-vite";
import { join, dirname, resolve } from "path";
import { mergeConfig } from "vite";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, "package.json")));
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
  viteFinal: async (config) => {
    return mergeConfig(config, {
      build: {
        rollupOptions: {
          external: ["vite-plugin-node-polyfills/shims/global"],
        },
      },
      resolve: {
        alias: {
          react: resolve(__dirname, "../node_modules/react"),
          "react-dom": resolve(__dirname, "../node_modules/react-dom"),
        },
      },
    });
  },
  staticDirs: ["../public"],
  previewHead: process.env.SNAPSHOT
    ? (head) =>
        `${head}<style>*{animation:none!important;} .starry-container{background-color:#000!important; opacity:1!important; visibility:hidden!important;}</style>`
    : undefined,
};

export default config;
