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
};

module.exports = nextConfig;
