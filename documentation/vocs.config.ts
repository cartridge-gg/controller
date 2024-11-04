import { defineConfig } from "vocs";
import svgr from "vite-plugin-svgr";

import packageJson from "./package.json";

export default defineConfig({
  title: "Cartridge Documentation",
  description:
    "High Performance Infrastructure for Provable Games and Applications",
  iconUrl: "/icon.svg",
  logoUrl: "/cartridge.svg",
  ogImageUrl:
    "https://og-image.preview.cartridge.gg/api/cartridge?logo=%https://www.dojoengine.org/dojo-icon.svg&title=%title&description=%description",

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
  topNav: [
    {
      text: packageJson.version,
      items: [
        {
          text: "Releases",
          link: "https://github.com/cartridge-gg/controller/releases",
        },
        {
          text: "Changelog",
          link: "https://github.com/cartridge-gg/controller/releases",
        },
      ],
    },
  ],
  socials: [
    {
      icon: "github",
      link: "https://github.com/cartridge-gg/controller",
    },
    {
      icon: "x",
      link: "https://x.com/cartridge_gg",
    },
  ],
  editLink: {
    pattern:
      "https://github.com/cartridge-gg/controller/blob/main/docs/pages/:path",
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
  sidebar: [
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
          text: "Sessions",
          link: "/controller/sessions",
        },
        {
          text: "Configuration",
          link: "/controller/configuration",
        },
        {
          text: "Usernames",
          link: "/controller/usernames",
        },
        {
          text: "Theming",
          link: "/controller/theming",
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
    {
      text: "Slot",
      items: [
        {
          text: "Getting Started",
          link: "/slot/getting-started",
        },
      ],
    },
    {
      text: "VRF",
      items: [
        {
          text: "Overview",
          link: "/vrf/overview",
        },
      ],
    },
  ],

  // Vite configuration
  vite: {
    plugins: [svgr()],
  },
});
