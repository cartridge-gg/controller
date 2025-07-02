import { defineConfig } from "vocs";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  rootDir: "src",
  title: "Cartridge Documentation",
  description:
    "High Performance Infrastructure for Provable Games and Applications",
  iconUrl: "/icon.svg",
  logoUrl: "/cartridge.svg",
  ogImageUrl:
    "https://og.cartridge.gg/api/cartridge?title=%title&description=%description",

  theme: {
    colorScheme: "dark",
    variables: {
      color: {
        textAccent: "#ffc52a",
        background: "#0c0c0c",
        backgroundDark: "#121212",
        noteBackground: "#1a1a1a",
      },
    },
  },
  font: {
    google: "Open Sans",
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/cartridge-gg/docs",
    },
    {
      icon: "x",
      link: "https://x.com/cartridge_gg",
    },
  ],
  editLink: {
    pattern: "https://github.com/cartridge-gg/docs/blob/main/src/pages/:path",
    text: "Edit on GitHub",
  },

  // Banner configuration
  banner: {
    dismissable: true,
    backgroundColor: "#ffc52a",
    content: "Join us in [Discord](https://discord.gg/cartridge)!",
    height: "35px",
    textColor: "rgb(26, 28, 27)",
  },

  // Separate sidebars for different sections
  sidebar: {
    // Controller sidebar
    "/controller": [
      {
        text: "Controller",
        items: [
          {
            text: "Overview",
            link: "/controller/overview",
          },
          {
            text: "Getting Started",
            link: "/controller/getting-started",
          },
          {
            text: "Migration Guide",
            link: "/controller/migration-guide",
          },
          {
            text: "Passkey Support",
            link: "/controller/passkey-support",
          },
          {
            text: "Configuration",
            link: "/controller/configuration",
          },
          {
            text: "Sessions",
            link: "/controller/sessions",
          },
          {
            text: "Paymaster",
            link: "/controller/paymaster",
          },
          {
            text: "Presets",
            link: "/controller/presets",
          },
          {
            text: "Usernames",
            link: "/controller/usernames",
          },
          {
            text: "Achievements",
            link: "/controller/achievements",
            items: [
              {
                text: "Setup",
                link: "/controller/achievements/setup",
              },
              {
                text: "Creation",
                link: "/controller/achievements/creation",
              },
              {
                text: "Progression",
                link: "/controller/achievements/progression",
              },
              {
                text: "Integration",
                link: "/controller/achievements/integration",
              },
              {
                text: "Testing",
                link: "/controller/achievements/testing",
              },
            ],
          },
          {
            text: "Inventory",
            link: "/controller/inventory",
          },
          {
            text: "Controller Examples",
            items: [
              {
                text: "React",
                link: "/controller/examples/react",
              },
              {
                text: "Svelte",
                link: "/controller/examples/svelte",
              },
              {
                text: "Node",
                link: "/controller/examples/node",
              },
              {
                text: "Rust",
                link: "/controller/examples/rust",
              },
              {
                text: "Telegram",
                link: "/controller/examples/telegram",
              },
            ],
          },
        ],
      },
    ],

    // Arcade sidebar
    "/arcade": [
      {
        text: "Arcade",
        items: [
          {
            text: "Overview",
            link: "/arcade/overview",
          },
          {
            text: "Setup",
            link: "/arcade/setup",
          },
        ],
      },
    ],

    // Slot sidebar (now includes VRF)
    "/slot": [
      {
        text: "Slot",
        items: [
          {
            text: "Getting Started",
            link: "/slot/getting-started",
          },
          {
            text: "Scale",
            link: "/slot/scale",
          },
          {
            text: "Paymaster",
            link: "/slot/paymaster",
          },
          {
            text: "vRNG",
            link: "/slot/vrng",
          },
        ],
      },
    ],
  },

  // Twoslash configuration
  twoslash: {},

  // Vite configuration
  vite: {
    plugins: [svgr()],
  },
});
