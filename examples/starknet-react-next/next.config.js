/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    externalDir: true,
  },
  env: {
    XFRAME_URL: process.env.XFRAME_URL,
  },
};

export default nextConfig;
