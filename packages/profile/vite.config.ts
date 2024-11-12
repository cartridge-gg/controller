import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import process from "node:process";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.NODE_ENV === "development" ? 3003 : undefined,
    proxy: {
      "/ingest/static": `https://us-assets.i.posthog.com/static`,
      "^/ingest/.*": {
        target: "https://us.i.posthog.com",
        changeOrigin: true,
      },
      "/ingest/decide": {
        target: "https://us.i.posthog.com/decide",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  root: "./",
  build: {
    outDir: "dist",
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
