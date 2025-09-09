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
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  server: {
    port: mode === "development" ? 3001 : undefined,
    allowedHosts: ["qud-macbook.quddus.sfs.elyas.my"],
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
          if (id.includes("commonjsHelpers.js")) {
            return "commonjs";
          }

          // Chunk splitting logic
          if (id.includes("node_modules")) {
            if (id.includes("react")) {
              return "react-vendor";
            }
            // Split other large dependencies into separate chunks
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
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    server: {
      deps: {
        inline: ["@cartridge/ui", "@cartridge/controller-wasm"],
      },
    },
  },
}));
