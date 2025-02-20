import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import { mergeConfig } from "vite";

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
      build: {
        rollupOptions: {
          external: ["vite-plugin-node-polyfills/shims/global"],
        },
      },
      resolve: {
        alias: {
          "@cartridge/utils/api/cartridge": require.resolve(
            "../node_modules/@cartridge/utils/dist/api/cartridge/index.js",
          ),
          "@cartridge/utils/api/indexer": require.resolve(
            "../node_modules/@cartridge/utils/dist/api/indexer/index.js",
          ),
          "@cartridge/utils/mock/data": require.resolve(
            "../node_modules/@cartridge/utils/dist/mock/data/index.js",
          ),
          "@cartridge/utils": require.resolve(
            "../node_modules/@cartridge/utils/dist/index.mock.js",
          ),
        },
      },
    }),
  staticDirs: ["../public"],
  previewHead: (head) => `
    ${head}
    ${
      process.env.SNAPSHOT &&
      `<style>
      * {
        animation: none !important;
      }
    </style>`
    }
  `,
};
export default config;
