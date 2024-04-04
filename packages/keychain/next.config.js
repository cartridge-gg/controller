/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    externalDir: true,
  },
  images: {
    domains: ["static.cartridge.gg", "static.localhost"],
  },
  webpack: function (config) {
    config.experiments = { asyncWebAssembly: true };
    return config;
  },
};

module.exports = nextConfig;
