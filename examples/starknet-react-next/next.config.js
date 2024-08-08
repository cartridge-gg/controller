/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  env: {
    XFRAME_URL: process.env.XFRAME_URL,
  },
};

module.exports = nextConfig;
