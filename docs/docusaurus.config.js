// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cartridge',
  tagline: 'Cartridge Gaming Console',
  url: 'https://docs.cartridge.gg/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/cartridge-gg/cartridge/tree/main/docs',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Cartridge',
        logo: {
          alt: 'Cartridge Gaming Company',
          src: 'img/logo.svg',
        },
        items: [
          {
            href: 'https://github.com/cartridge-gg/cartridge',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Controller',
                to: '/controller',
              },
              {
                label: 'Quests',
                to: '/quests',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discor.gg/cartridge',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/cartridge_gg',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/cartridge-gg/cartridge',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Cartridge Gaming Company. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
