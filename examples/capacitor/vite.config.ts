import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  base: "./",
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@cartridge/controller/session": fileURLToPath(
        new URL("../../packages/controller/src/session/index.ts", import.meta.url),
      ),
    },
  },
});
