import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import react from "@vitejs/plugin-react-swc";
import topLevelAwait from "vite-plugin-top-level-await";
import process from "node:process";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  server: {
    port: process.env.NODE_ENV === "development" ? 3003 : undefined,
  },
  root: "./",
  build: {
    outDir: "dist",
    target: "esnext",
    // Ref: https://github.com/vitejs/vite/issues/15012#issuecomment-1948550039
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === "SOURCEMAP_ERROR") {
          return;
        }

        defaultHandler(warning);
      },
    },
  },
  publicDir: "public",
});
