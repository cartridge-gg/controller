import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import topLevelAwait from "vite-plugin-top-level-await";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const resolveFromRoot = (path: string) => resolve(rootDir, path);

const wasmMockPlugin = () => ({
  name: "wasm-mock",
  enforce: "pre" as const,
  resolveId(id: string) {
    if (
      id.endsWith(".wasm") ||
      id.includes("dojo_c_bg.wasm") ||
      id.includes("dojo_wasm_bg.wasm")
    ) {
      return "\0wasm-stub";
    }
    return null;
  },
  load(id: string) {
    if (id === "\0wasm-stub") {
      return "export default {}; export const __wbindgen_start = () => {};";
    }
    return null;
  },
});

export default defineConfig({
  plugins: [
    wasmMockPlugin(),
    // @ts-expect-error - vite version mismatch between plugins and vitest
    nodePolyfills({
      include: ["buffer"],
      globals: {
        Buffer: true,
      },
    }),
    // @ts-expect-error - vite version mismatch between plugins and vitest
    topLevelAwait(),
    // @ts-expect-error - vite version mismatch between plugins and vitest
    react(),
  ],
  define: {
    global: "globalThis",
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  test: {
    pool: "forks",
    environment: "jsdom",
    globals: true,
    setupFiles: [resolveFromRoot("src/test/setup.ts")],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "node_modules/**",
        "src/test/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.stories.{ts,tsx}",
        "src/**/__mocks__/**",
      ],
    },
    server: {
      deps: {
        external: ["**/dojo_wasm_bg.wasm", "@dojoengine/torii-wasm", /\.wasm$/],
        inline: ["@cartridge/ui", "@cartridge/controller-wasm"],
      },
    },
    deps: {
      interopDefault: true,
      optimizer: {
        web: {
          exclude: ["@dojoengine/torii-wasm"],
        },
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /^@dojoengine\/torii-wasm\/pkg\/web\/dojo_wasm_bg\.wasm$/,
        replacement: resolveFromRoot("src/__mocks__/torii-wasm-pkg.ts"),
      },
      {
        find: /dojo_wasm_bg\.wasm$/,
        replacement: resolveFromRoot("src/__mocks__/torii-wasm-pkg.ts"),
      },
      {
        find: /^@dojoengine\/torii-wasm$/,
        replacement: resolveFromRoot("src/__mocks__/torii-wasm.ts"),
      },
      {
        find: "@dojoengine/torii-wasm",
        replacement: resolveFromRoot("src/__mocks__/torii-wasm.ts"),
      },
      {
        find: "@",
        replacement: resolveFromRoot("src"),
      },
    ],
  },
});
