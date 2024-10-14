/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  env: {
    KEYCHAIN_FRAME_URL: process.env.KEYCHAIN_FRAME_URL,
    PROFILE_FRAME_URL: process.env.PROFILE_FRAME_URL,
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Optionally, add this rule to handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    return config;
  },
};

module.exports = nextConfig;
