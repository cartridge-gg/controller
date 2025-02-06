import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { visualizer } from "rollup-plugin-visualizer";

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
    // Add visualizer in build mode
    mode === "production" &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  server: {
    port: mode === "development" ? 3001 : undefined,
  },
  resolve: {
    alias: {
      "@": "/src",
      ...(mode === "production"
        ? {
            "fetch-cookie": "/src/shims/fetch-cookie.ts",
            pako: "/src/shims/pako.ts",
          }
        : {}),
    },
  },
  root: "./",
  publicDir: "public",
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // React and related packages
            if (id.includes("react/") || id.includes("react-dom/")) {
              return "react-core";
            }
            // React ecosystem packages
            if (id.includes("react-router") || id.includes("react-query")) {
              return "react-libs";
            }
            // Stripe related code
            if (id.includes("@stripe")) {
              return "stripe";
            }
            // Web3 and crypto related code
            if (
              id.includes("wagmi") ||
              id.includes("viem") ||
              id.includes("starknet") ||
              id.includes("@noble/") ||
              id.includes("caip") ||
              id.includes("@starknet-react") ||
              id.includes("@cartridge/account-wasm") ||
              id.includes("@cartridge/controller") ||
              id.includes("cbor")
            ) {
              return "web3";
            }
            // UI components and styling
            if (
              id.includes("@cartridge/ui-next") ||
              id.includes("embla-carousel")
            ) {
              return "ui";
            }
            return "vendor";
          }
        },
      },
    },
    target: "esnext",
    minify: "esbuild",
    sourcemap: mode === "development",
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    cssCodeSplit: true,
    modulePreload: {
      polyfill: false,
    },
    timeout: 120000,
    assetsInlineLimit: 4096,
    commonjsOptions: {
      include: [/node_modules/],
      extensions: [".js", ".cjs"],
      strictRequires: true,
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-query",
      "@cartridge/ui-next",
    ],
    exclude: ["@cartridge/account-wasm"],
    esbuildOptions: {
      target: "esnext",
      supported: {
        "top-level-await": true,
      },
    },
  },
  define: {
    global: "globalThis",
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
}));
