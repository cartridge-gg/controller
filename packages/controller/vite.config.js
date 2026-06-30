import { defineConfig } from "vite";
import { resolve } from "path";
import { execFileSync } from "child_process";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";

// Generate dist/ui/styles.css after the bundle is written. Done as a build
// hook (not just a separate `build:styles` script) so it also runs on every
// `vite build --watch` rebuild during `pnpm dev` — otherwise emptyOutDir wipes
// styles.css and consumers importing `@cartridge/controller/ui/styles.css`
// (e.g. the next example) fail to resolve it in dev.
const buildUiStyles = () => ({
  name: "controller-ui-styles",
  closeBundle() {
    execFileSync(
      process.execPath,
      [resolve(__dirname, "bin/build-ui-styles.mjs")],
      { stdio: "inherit" },
    );
  },
});

// List peer dependencies, prevents bundling into library.
// react / react-dom are externalized so the `ui` chunk treats them as
// (optional) peer deps instead of bundling a second React copy; "react"
// also covers "react/jsx-runtime" via the prefix check below. The rest of
// the UI dependencies (controller-ui, sonner, radix, etc.) are intentionally
// bundled into the ui chunk.
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
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
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
        "ui/index": resolve(__dirname, "src/ui/index.ts"),
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