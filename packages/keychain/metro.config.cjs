const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Add crypto polyfill for web platform and path aliases
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: require.resolve("crypto-browserify"),
  "@": path.resolve(projectRoot, "src"),
};

// 4. Ensure platform-specific resolution
config.resolver.platforms = ["native", "web", "ios", "android"];

// 5. Enable web support
config.resolver.resolverMainFields = ["react-native", "browser", "main"];
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = false;

// 6. Add WASM support for Metro
config.resolver.assetExts = [...config.resolver.assetExts, "wasm"];

module.exports = config;
