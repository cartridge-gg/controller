const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const { withNativeWind } = require("nativewind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, "../..");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Setup polyfills for web platform using extraNodeModules
config.resolver.extraNodeModules = {
  crypto: require.resolve("crypto-browserify"),
  "node:crypto": require.resolve("crypto-browserify"),
  stream: require.resolve("readable-stream"),
  buffer: require.resolve("buffer"),
};

// 4. Setup path aliases
config.resolver.alias = {
  ...config.resolver.alias,
  "@": path.resolve(projectRoot, "src"),
  // Fix for rpc-websockets package export conditions
  "rpc-websockets": path.resolve(
    monorepoRoot,
    "node_modules/.pnpm/rpc-websockets@9.1.1/node_modules/rpc-websockets/dist/index.browser.cjs",
  ),
};

// 5. Ensure platform-specific resolution
config.resolver.platforms = ["native", "web", "ios", "android"];

// 6. Configure package export conditions
// config.resolver.unstable_conditionNames = [
//   "browser",
//   "react-native",
//   "import",
//   "require",
//   "node",
//   "default",
// ];

// 7. Add WASM support for Metro
config.resolver.assetExts = [...config.resolver.assetExts, "wasm"];

module.exports = wrapWithReanimatedMetroConfig(
  withNativeWind(config, { input: "src/index.css" }),
);
