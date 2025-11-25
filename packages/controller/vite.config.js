import { defineConfig } from "vite";
import { resolve } from "path";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";

// List peer dependencies, prevents bundling into library
const externalDeps = [
  "open",
  "starknet",
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