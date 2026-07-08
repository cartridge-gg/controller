import { defineConfig } from "vite";
import { resolve } from "path";
import { execFileSync } from "child_process";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";

// Generate dist/react/styles.css after the bundle is written. Done as a build
// hook (not just a separate `build:styles` script) so it also runs on every
// `vite build --watch` rebuild during `pnpm dev` — otherwise emptyOutDir wipes
// styles.css and consumers importing `@cartridge/controller/react/styles.css`
// (e.g. the next example) fail to resolve it in dev.
const buildUiStyles = () => ({
  name: "controller-ui-styles",
  closeBundle() {
    execFileSync(
      process.execPath,
      [resolve(__dirname, "bin/build-react-styles.mjs")],
      { stdio: "inherit" },
    );
  },
});

// List peer dependencies, prevents bundling into library.
// react / react-dom are externalized so the `react` chunk treats them as
// (optional) peer deps instead of bundling a second React copy; "react"
// also covers "react/jsx-runtime" via the prefix check below. The rest of
// the UI dependencies (controller-ui, sonner, radix, etc.) are intentionally
// bundled into the react chunk.
const externalDeps = [
  "open",
  "starknet",
  "react",
  "react-dom",
];

export default defineConfig(({ mode }) => ({
  plugins: [
    wasm(),
    topLevelAwait(),
    dts({
      entryRoot: 'src',
      insertTypesEntry: true,
      // src/global.d.ts (the internal-only Window augmentation) is inside
      // include so the plugin's program typechecks, but as a source .d.ts it
      // is never emitted (copyDtsFiles defaults to false) — which keeps
      // `declare global` out of the published types, where the bundler would
      // append it to every entry and leave it dangling in ones that don't
      // declare WalletBridge.
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      // Flatten each entry's declarations into a single self-contained d.ts.
      // Required so `src/react/index.ts` can re-export types from
      // `@cartridge/controller-ui` (bundled at build time, not published to
      // npm) without the emitted types referencing that package.
      bundleTypes: {
        bundledPackages: ["@cartridge/controller-ui"],
      },
    }),
    mode === "production" &&
      visualizer({
        open: false,
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
    buildUiStyles(),
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  // Important for some polyfills like 'process' or if libraries expect 'global'
  define: {
    global: "globalThis",
    // Example: If a dependency needs process.env.NODE_ENV
    // 'process.env.NODE_ENV': JSON.stringify(mode),
  },

  build: {
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        session: resolve(__dirname, "src/session/index.ts"),
        "react/index": resolve(__dirname, "src/react/index.ts"),
      },
      name: "CartridgeController",
      formats: ["es"],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: (id) => {
        if (id.includes("@cartridge/controller-wasm")) {
          return true;
        }

        if (id.endsWith(".wasm")) {
          return true;
        }

        return externalDeps.some(
          (dep) => id === dep || id.startsWith(`${dep}/`)
        );
      },
    },
    target: "esnext",
    minify: mode === "production" ? "esbuild" : false,
  },
  test: {
    environment: "jsdom", 
    globals: true,
  },
}));