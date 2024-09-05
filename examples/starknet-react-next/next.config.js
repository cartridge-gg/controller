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
};

module.exports = nextConfig;
