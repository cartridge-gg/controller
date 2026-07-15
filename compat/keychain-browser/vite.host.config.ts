import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const alias = process.env.COMPAT_SDK_ALIAS;
const sdkVersion = process.env.COMPAT_SDK_VERSION;
const outDir = process.env.COMPAT_HOST_OUT_DIR;
if (!alias || !sdkVersion || !outDir)
  throw new Error("Missing compatibility host build variables");

export default defineConfig({
  root: __dirname,
  base: "./",
  resolve: {
    alias: {
      "compat-controller": path.resolve(
        __dirname,
        ".artifacts/sandbox/node_modules",
        alias,
      ),
    },
  },
  build: {
    target: "esnext",
    outDir,
    emptyOutDir: true,
  },
  define: {
    global: "globalThis",
    __COMPAT_SDK_VERSION__: JSON.stringify(sdkVersion),
  },
});
