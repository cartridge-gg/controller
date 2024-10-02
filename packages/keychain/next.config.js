/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  images: {
    domains: ["static.cartridge.gg", "static.localhost"],
  },
  webpack: function (config, { isServer, dev }) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    if (!isServer && !dev) {
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tapAsync('FingerprintWasmPlugin', (compilation, callback) => {
            const wasmFile = path.resolve(__dirname, '.next/static/wasm/webauthn.wasm');
            if (fs.existsSync(wasmFile)) {
              const fileBuffer = fs.readFileSync(wasmFile);
              const hashSum = crypto.createHash('sha256');
              hashSum.update(fileBuffer);
              const hash = hashSum.digest('hex').slice(0, 8);
              const newFileName = `webauthn.${hash}.wasm`;
              fs.renameSync(wasmFile, path.resolve(__dirname, '.next/static/wasm', newFileName));
              
              // Update the webassemblyModuleFilename to use the new file name
              config.output.webassemblyModuleFilename = `static/wasm/${newFileName}`;
            }
            callback();
          });
        },
      });
    } else {
      config.output.webassemblyModuleFilename = isServer
        ? "../static/wasm/webauthn.wasm"
        : "static/wasm/webauthn.wasm";
    }

    return config;
  },
  redirects: async function () {
    return [
      {
        source: "/slot/auth",
        destination: "/slot",
        permanent: true,
      },
      {
        source: "/slot/auth/success",
        destination: "/success",
        permanent: true,
      },
      {
        source: "/slot/auth/failure",
        destination: "/failure",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
