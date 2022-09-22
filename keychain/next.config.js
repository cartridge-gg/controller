/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    externalDir: true,
  },
}

module.exports = nextConfig
