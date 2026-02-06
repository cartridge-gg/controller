import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

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
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  server: {
    port: mode === "development" ? 3001 : undefined,
  },
  resolve: {
    dedupe: ["react", "react-dom"],
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
          if (id.includes("commonjsHelpers.js")) {
            return "commonjs";
          }
          if (id.includes("node_modules")) {
            // NOTE: @cartridge/arcade bundles React hooks (createContext) in its main entry.
            // It must be in the same chunk as React to ensure React is initialized first.
            if (id.includes("react") || id.includes("@cartridge/arcade")) {
              return "react-vendor";
            }
            return "vendor";
          }
        },
      },
    },
    target: "esnext",
    minify: "esbuild", // esbuild is faster than terser and almost as effective
    sourcemap: mode === "development",
    // Reduce chunk size warnings and enable compression reporting
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    // Optimize build speed and output
    cssCodeSplit: true,
    modulePreload: {
      polyfill: false, // Reduces polyfill size if you don't need older browser support
    },
    // Add a longer timeout for builds
    timeout: 120000, // 2 minutes
  },
  optimizeDeps: {
    include: ["react", "react-dom"], // Pre-bundle common dependencies
  },
  // Add this to ensure polyfills are properly included
  define: {
    global: "globalThis",
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
}));
