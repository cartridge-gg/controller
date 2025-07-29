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

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

config.resolver.extraNodeModules = {
  crypto: require.resolve("crypto-browserify"),
  "node:crypto": require.resolve("crypto-browserify"),
  stream: require.resolve("readable-stream"),
  buffer: require.resolve("buffer"),
};

config.resolver.assetExts.push("wasm");

module.exports = wrapWithReanimatedMetroConfig(
  withNativeWind(config, { input: "src/index.css" }),
);
