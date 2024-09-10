import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],
  resolve: {
    alias: {
      components: fileURLToPath(new URL("./src/components", import.meta.url)),
      utils: fileURLToPath(new URL("./src/utils", import.meta.url)),
      hooks: fileURLToPath(new URL("./src/hooks", import.meta.url)),
      generated: fileURLToPath(new URL("./src/generated", import.meta.url)),
    },
  },
});
