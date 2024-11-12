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
    // Use the client static directory in the server bundle and prod mode
    // Fixes `Error occurred prerendering page "/"`
    config.output.webassemblyModuleFilename =
      isServer && !dev
        ? "../static/wasm/[modulehash].wasm"
        : "static/wasm/[modulehash].wasm";

    // Since Webpack 5 doesn't enable WebAssembly by default, we should do it manually
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
  redirects: async () => {
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
  rewrites: async () => [
    {
      source: "/ingest/static/:path*",
      destination: `${process.env.POSTHOG_HOST}/static/:path*`,
    },
    {
      source: "/ingest/:path*",
      destination: `${process.env.POSTHOG_HOST}/:path*`,
    },
    {
      source: "/ingest/decide",
      destination: `${process.env.POSTHOG_HOST}/decide`,
    },
  ],
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
