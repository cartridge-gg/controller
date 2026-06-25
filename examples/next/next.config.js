/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer, dev }) => {
    // Disable the persistent filesystem cache in dev. Workspace deps
    // (@cartridge/controller, @cartridge/connector) are consumed as prebuilt
    // dist/ files; controller's `vite build --watch` re-empties its dist on
    // rebuild, so Next can momentarily compile an empty module and cache the
    // broken result (default === undefined → "is not a constructor"). The cache
    // otherwise survives dev restarts, forcing a full clean. Disabling it means
    // a plain restart always recovers.
    if (dev) config.cache = false;

    config.output.environment = {
      ...config.output.environment,
      asyncFunction: true,
    };

    // Since Webpack 5 doesn't enable WebAssembly by default, we should do it manually
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };

    // https://github.com/vercel/next.js/issues/29362#issuecomment-971377869
    if (!dev && isServer) {
      config.output.webassemblyModuleFilename = "chunks/[id].wasm";
      config.plugins.push(new WasmChunksFixPlugin());
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      [path.resolve(__dirname, "src/assets")]: path.resolve(
        path.dirname(require.resolve("@cartridge/controller-ui")),
        "assets",
      ),
    };

    return config;
  },
};

class WasmChunksFixPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("WasmChunksFixPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: "WasmChunksFixPlugin" },
        (assets) =>
          Object.entries(assets).forEach(([pathname, source]) => {
            if (!pathname.match(/\.wasm$/)) return;
            compilation.deleteAsset(pathname);

            const name = pathname.split("/")[1];
            const info = compilation.assetsInfo.get(pathname);
            compilation.emitAsset(name, source, info);
          }),
      );
    });
  }
}

module.exports = nextConfig;
