/** @type {import('next').NextConfig} */
export const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    externalDir: true,
  },
  env: {
    XFRAME_URL: process.env.XFRAME_URL,
  },
  transpilePackages: ["@cartridge/ui-next"],
  experimental: {
    esmExternals: "loose",
  },
};
