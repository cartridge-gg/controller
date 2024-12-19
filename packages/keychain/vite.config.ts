import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import process from "node:process";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [wasm(), topLevelAwait(), react()],
  server: {
    port: process.env.NODE_ENV === "development" ? 3001 : undefined,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  root: "./",
  publicDir: "public",
});
