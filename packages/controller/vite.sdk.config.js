import { defineConfig } from "vite";
import { resolve } from "path";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  plugins: [
    wasm(),
    topLevelAwait(),
    mode === "production" &&
      visualizer({
        open: false,
        filename: "dist/sdk/stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  define: {
    global: "globalThis",
  },

  build: {
    outDir: "dist/sdk",
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/sdk.ts"),
      name: "CartridgeSDK",
      formats: ["iife"],
      fileName: () => "sdk.js",
    },
    rollupOptions: {
      // No externals — everything is inlined into the bundle
    },
    target: "esnext",
    minify: mode === "production" ? "esbuild" : false,
  },
}));
