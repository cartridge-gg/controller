import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "@cartridge/ui",
      fileName: "index",
    },
    rollupOptions: {
      // Ref: https://github.com/emotion-js/emotion/issues/2853
      external: makeExternalPredicate(Object.keys(pkg.peerDependencies)),
    },
    outDir: "dist",
  },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    dts(),
  ],
});

function makeExternalPredicate(externalArr: string[]) {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return (id: string) => pattern.test(id);
}
