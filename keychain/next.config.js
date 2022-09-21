/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  experimental: {
    externalDir: true,
  },
  // swcMinify: true,
}

module.exports = nextConfig
