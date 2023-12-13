// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "file:///Users/js/Projects/github.com/cartridge-gg/cartridge/node_modules/.pnpm/vite@4.4.9_@types+node@20.6.0/node_modules/vite/dist/node/index.js";
import react from "file:///Users/js/Projects/github.com/cartridge-gg/cartridge/node_modules/.pnpm/@vitejs+plugin-react@4.0.4_vite@4.4.9/node_modules/@vitejs/plugin-react/dist/index.mjs";
import dts from "file:///Users/js/Projects/github.com/cartridge-gg/cartridge/node_modules/.pnpm/vite-plugin-dts@3.5.3_@types+node@20.6.0_typescript@5.2.2_vite@4.4.9/node_modules/vite-plugin-dts/dist/index.mjs";

// package.json
var package_default = {
  name: "@cartridge/ui",
  version: "0.2.16",
  main: "lib/index.umd.cjs",
  module: "lib/index.js",
  types: "lib/index.d.ts",
  type: "module",
  scripts: {
    build: "vite build",
    format: "prettier ./src --write",
    storybook: "storybook dev -p 6006",
    "storybook:build": "storybook build"
  },
  files: [
    "lib",
    "README.md"
  ],
  peerDependencies: {
    "@chakra-ui/react": "^2.8.1",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "framer-motion": "^6",
    react: "^18.2.0",
    "react-dom": "^18.2.0"
  },
  devDependencies: {
    "@emotion/babel-plugin": "^11.11.0",
    "@next/font": "^13.4.19",
    "@storybook/addon-essentials": "^7.1.1",
    "@storybook/nextjs": "^7.4.2",
    "@storybook/react": "^7.1.1",
    "@storybook/react-vite": "^7.1.1",
    "@storybook/testing-library": "^0.2.0",
    "@types/node": "^20.6.0",
    "@types/react": "^18.2.21",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.4",
    eslint: "8.9.0",
    "eslint-config-prettier": "^8.5.0",
    "eslint-plugin-storybook": "^0.6.13",
    storybook: "^7.1.1",
    "storybook-dark-mode": "^3.0.1",
    tslib: "^2.3.1",
    vite: "^4.4.9",
    "vite-plugin-dts": "^3.5.3"
  },
  dependencies: {
    "@chakra-ui/anatomy": "^2.2.1"
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "/Users/js/Projects/github.com/cartridge-gg/cartridge/packages/ui";
var vite_config_default = defineConfig({
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "@cartridge/ui",
      fileName: "index"
    },
    rollupOptions: {
      // Ref: https://github.com/emotion-js/emotion/issues/2853
      external: makeExternalPredicate(Object.keys(package_default.peerDependencies))
    },
    outDir: "lib"
  },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"]
      }
    }),
    dts()
  ]
});
function makeExternalPredicate(externalArr) {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join("|")})($|/)`);
  return (id) => pattern.test(id);
}
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2pzL1Byb2plY3RzL2dpdGh1Yi5jb20vY2FydHJpZGdlLWdnL2NhcnRyaWRnZS9wYWNrYWdlcy91aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2pzL1Byb2plY3RzL2dpdGh1Yi5jb20vY2FydHJpZGdlLWdnL2NhcnRyaWRnZS9wYWNrYWdlcy91aS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvanMvUHJvamVjdHMvZ2l0aHViLmNvbS9jYXJ0cmlkZ2UtZ2cvY2FydHJpZGdlL3BhY2thZ2VzL3VpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XG5pbXBvcnQgcGtnIGZyb20gXCIuL3BhY2thZ2UuanNvblwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYnVpbGQ6IHtcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvaW5kZXgudHNcIiksXG4gICAgICBuYW1lOiBcIkBjYXJ0cmlkZ2UvdWlcIixcbiAgICAgIGZpbGVOYW1lOiBcImluZGV4XCIsXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAvLyBSZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9lbW90aW9uLWpzL2Vtb3Rpb24vaXNzdWVzLzI4NTNcbiAgICAgIGV4dGVybmFsOiBtYWtlRXh0ZXJuYWxQcmVkaWNhdGUoT2JqZWN0LmtleXMocGtnLnBlZXJEZXBlbmRlbmNpZXMpKSxcbiAgICB9LFxuICAgIG91dERpcjogXCJsaWJcIixcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KHtcbiAgICAgIGpzeEltcG9ydFNvdXJjZTogXCJAZW1vdGlvbi9yZWFjdFwiLFxuICAgICAgYmFiZWw6IHtcbiAgICAgICAgcGx1Z2luczogW1wiQGVtb3Rpb24vYmFiZWwtcGx1Z2luXCJdLFxuICAgICAgfSxcbiAgICB9KSxcbiAgICBkdHMoKSxcbiAgXSxcbn0pO1xuXG5mdW5jdGlvbiBtYWtlRXh0ZXJuYWxQcmVkaWNhdGUoZXh0ZXJuYWxBcnI6IHN0cmluZ1tdKSB7XG4gIGlmIChleHRlcm5hbEFyci5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gKCkgPT4gZmFsc2U7XG4gIH1cbiAgY29uc3QgcGF0dGVybiA9IG5ldyBSZWdFeHAoYF4oJHtleHRlcm5hbEFyci5qb2luKFwifFwiKX0pKCR8LylgKTtcbiAgcmV0dXJuIChpZDogc3RyaW5nKSA9PiBwYXR0ZXJuLnRlc3QoaWQpO1xufVxuIiwgIntcbiAgXCJuYW1lXCI6IFwiQGNhcnRyaWRnZS91aVwiLFxuICBcInZlcnNpb25cIjogXCIwLjIuMTZcIixcbiAgXCJtYWluXCI6IFwibGliL2luZGV4LnVtZC5janNcIixcbiAgXCJtb2R1bGVcIjogXCJsaWIvaW5kZXguanNcIixcbiAgXCJ0eXBlc1wiOiBcImxpYi9pbmRleC5kLnRzXCIsXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwiYnVpbGRcIjogXCJ2aXRlIGJ1aWxkXCIsXG4gICAgXCJmb3JtYXRcIjogXCJwcmV0dGllciAuL3NyYyAtLXdyaXRlXCIsXG4gICAgXCJzdG9yeWJvb2tcIjogXCJzdG9yeWJvb2sgZGV2IC1wIDYwMDZcIixcbiAgICBcInN0b3J5Ym9vazpidWlsZFwiOiBcInN0b3J5Ym9vayBidWlsZFwiXG4gIH0sXG4gIFwiZmlsZXNcIjogW1xuICAgIFwibGliXCIsXG4gICAgXCJSRUFETUUubWRcIlxuICBdLFxuICBcInBlZXJEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGNoYWtyYS11aS9yZWFjdFwiOiBcIl4yLjguMVwiLFxuICAgIFwiQGVtb3Rpb24vcmVhY3RcIjogXCJeMTEuMTEuMVwiLFxuICAgIFwiQGVtb3Rpb24vc3R5bGVkXCI6IFwiXjExLjExLjBcIixcbiAgICBcImZyYW1lci1tb3Rpb25cIjogXCJeNlwiLFxuICAgIFwicmVhY3RcIjogXCJeMTguMi4wXCIsXG4gICAgXCJyZWFjdC1kb21cIjogXCJeMTguMi4wXCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGVtb3Rpb24vYmFiZWwtcGx1Z2luXCI6IFwiXjExLjExLjBcIixcbiAgICBcIkBuZXh0L2ZvbnRcIjogXCJeMTMuNC4xOVwiLFxuICAgIFwiQHN0b3J5Ym9vay9hZGRvbi1lc3NlbnRpYWxzXCI6IFwiXjcuMS4xXCIsXG4gICAgXCJAc3Rvcnlib29rL25leHRqc1wiOiBcIl43LjQuMlwiLFxuICAgIFwiQHN0b3J5Ym9vay9yZWFjdFwiOiBcIl43LjEuMVwiLFxuICAgIFwiQHN0b3J5Ym9vay9yZWFjdC12aXRlXCI6IFwiXjcuMS4xXCIsXG4gICAgXCJAc3Rvcnlib29rL3Rlc3RpbmctbGlicmFyeVwiOiBcIl4wLjIuMFwiLFxuICAgIFwiQHR5cGVzL25vZGVcIjogXCJeMjAuNi4wXCIsXG4gICAgXCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMi4yMVwiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4yLjdcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI6IFwiXjQuMC40XCIsXG4gICAgXCJlc2xpbnRcIjogXCI4LjkuMFwiLFxuICAgIFwiZXNsaW50LWNvbmZpZy1wcmV0dGllclwiOiBcIl44LjUuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi1zdG9yeWJvb2tcIjogXCJeMC42LjEzXCIsXG4gICAgXCJzdG9yeWJvb2tcIjogXCJeNy4xLjFcIixcbiAgICBcInN0b3J5Ym9vay1kYXJrLW1vZGVcIjogXCJeMy4wLjFcIixcbiAgICBcInRzbGliXCI6IFwiXjIuMy4xXCIsXG4gICAgXCJ2aXRlXCI6IFwiXjQuNC45XCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1kdHNcIjogXCJeMy41LjNcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAY2hha3JhLXVpL2FuYXRvbXlcIjogXCJeMi4yLjFcIlxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtYLFNBQVMsZUFBZTtBQUMxWSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxTQUFTOzs7QUNIaEI7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLE1BQVE7QUFBQSxFQUNSLFFBQVU7QUFBQSxFQUNWLE9BQVM7QUFBQSxFQUNULE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxJQUNULE9BQVM7QUFBQSxJQUNULFFBQVU7QUFBQSxJQUNWLFdBQWE7QUFBQSxJQUNiLG1CQUFtQjtBQUFBLEVBQ3JCO0FBQUEsRUFDQSxPQUFTO0FBQUEsSUFDUDtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxrQkFBb0I7QUFBQSxJQUNsQixvQkFBb0I7QUFBQSxJQUNwQixrQkFBa0I7QUFBQSxJQUNsQixtQkFBbUI7QUFBQSxJQUNuQixpQkFBaUI7QUFBQSxJQUNqQixPQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsRUFDZjtBQUFBLEVBQ0EsaUJBQW1CO0FBQUEsSUFDakIseUJBQXlCO0FBQUEsSUFDekIsY0FBYztBQUFBLElBQ2QsK0JBQStCO0FBQUEsSUFDL0IscUJBQXFCO0FBQUEsSUFDckIsb0JBQW9CO0FBQUEsSUFDcEIseUJBQXlCO0FBQUEsSUFDekIsOEJBQThCO0FBQUEsSUFDOUIsZUFBZTtBQUFBLElBQ2YsZ0JBQWdCO0FBQUEsSUFDaEIsb0JBQW9CO0FBQUEsSUFDcEIsd0JBQXdCO0FBQUEsSUFDeEIsUUFBVTtBQUFBLElBQ1YsMEJBQTBCO0FBQUEsSUFDMUIsMkJBQTJCO0FBQUEsSUFDM0IsV0FBYTtBQUFBLElBQ2IsdUJBQXVCO0FBQUEsSUFDdkIsT0FBUztBQUFBLElBQ1QsTUFBUTtBQUFBLElBQ1IsbUJBQW1CO0FBQUEsRUFDckI7QUFBQSxFQUNBLGNBQWdCO0FBQUEsSUFDZCxzQkFBc0I7QUFBQSxFQUN4QjtBQUNGOzs7QURqREEsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsSUFDWjtBQUFBLElBQ0EsZUFBZTtBQUFBO0FBQUEsTUFFYixVQUFVLHNCQUFzQixPQUFPLEtBQUssZ0JBQUksZ0JBQWdCLENBQUM7QUFBQSxJQUNuRTtBQUFBLElBQ0EsUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxNQUNKLGlCQUFpQjtBQUFBLE1BQ2pCLE9BQU87QUFBQSxRQUNMLFNBQVMsQ0FBQyx1QkFBdUI7QUFBQSxNQUNuQztBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsSUFBSTtBQUFBLEVBQ047QUFDRixDQUFDO0FBRUQsU0FBUyxzQkFBc0IsYUFBdUI7QUFDcEQsTUFBSSxZQUFZLFdBQVcsR0FBRztBQUM1QixXQUFPLE1BQU07QUFBQSxFQUNmO0FBQ0EsUUFBTSxVQUFVLElBQUksT0FBTyxLQUFLLFlBQVksS0FBSyxHQUFHLENBQUMsUUFBUTtBQUM3RCxTQUFPLENBQUMsT0FBZSxRQUFRLEtBQUssRUFBRTtBQUN4QzsiLAogICJuYW1lcyI6IFtdCn0K
