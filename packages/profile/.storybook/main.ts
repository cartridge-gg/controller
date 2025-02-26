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
          "@/hooks/collection": require.resolve(
            "../src/hooks/collection.mock.ts",
          ),
          "@/hooks/token": require.resolve("../src/hooks/token.mock.ts"),
          "@cartridge/utils/api/cartridge": require.resolve(
            "../node_modules/@cartridge/utils/dist/api/cartridge/index.js",
          ),
          "@cartridge/utils/api/indexer": require.resolve(
            "../node_modules/@cartridge/utils/dist/api/indexer/index.js",
          ),
          "@cartridge/utils/mock/data": require.resolve(
            "../node_modules/@cartridge/utils/dist/mock/data/index.js",
          ),
        },
      },
    }),
  previewHead: process.env.SNAPSHOT
    ? (head) => `${head}<style>*{animation:none!important;}</style>`
    : undefined,
};
export default config;
