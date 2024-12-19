import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => ({
  plugins: [
    nodePolyfills({
      include: ["buffer"],
      globals: {
        Buffer: true,
      },
    }),
    wasm(),
    topLevelAwait(),
    react(),
  ],
  server: {
    port: mode === "development" ? 3001 : undefined,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  root: "./",
  publicDir: "public",
  build: {
    rollupOptions: {
      external: ["vite-plugin-node-polyfills/shims/global"],
    },
  },
}));
