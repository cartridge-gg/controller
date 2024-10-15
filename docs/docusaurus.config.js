// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Cartridge",
  tagline: "Cartridge Gaming Console",
  url: "https://docs.cartridge.gg/",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/cartridge-gg/cartridge/tree/main/docs",
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: "Cartridge Gaming Company",
          src: "img/cartridge.svg",
        },
        items: [
          {
            to: "/controller/overview",
            label: "Controller",
            position: "left",
          },
          {
            to: "/slot/getting-started",
            label: "Slot",
            position: "left",
          },
          {
            to: "/vrf/overview",
            label: "vrf",
            position: "left",
          },
          {
            href: "https://github.com/cartridge-gg/cartridge",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Community",
            items: [
              {
                label: "Discord",
                href: "https://discor.gg/cartridge",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/cartridge_gg",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/cartridge-gg/controller",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Cartridge Gaming Company.`,
      },
      prism: {
        theme: prismThemes.dracula,
        additionalLanguages: ["rust"],
      },
      colorMode: {
        defaultMode: "dark",
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      breadcrumbs: {
        enabled: false,
      },
    }),
  customFields: {
    headTags: [
      {
        tagName: "link",
        attributes: {
          rel: "stylesheet",
          href: "/path/to/your/fonts-and-styles.css",
        },
      },
      {
        tagName: "link",
        attributes: {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
      },
      {
        tagName: "link",
        attributes: {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
      },
      {
        tagName: "link",
        attributes: {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fragment+Mono:ital@0;1&display=swap",
        },
      },
      {
        tagName: "link",
        attributes: {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fragment+Mono:ital@0;1&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap",
        },
      },
    ],
  },
  stylesheets: [
    {
      href: "https://fonts.googleapis.com/css2?family=Fragment+Mono:ital@0;1&display=swap",
      rel: "stylesheet",
    },
    {
      href: "https://fonts.googleapis.com/css2?family=Fragment+Mono:ital@0;1&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap",
      rel: "stylesheet",
    },
  ],
};

module.exports = config;
