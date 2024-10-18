// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  controller: [
    "controller/overview",
    "controller/getting-started",
    "controller/configuration",
    "controller/sessions",
    "controller/usernames",
    "controller/theming",
    {
      type: "category",
      label: "Examples",
      collapsed: false,
      items: [
        "controller/examples/react",
        "controller/examples/svelte",
        // "controller/examples/rust",
        "controller/examples/telegram",
      ],
    },
  ],
  // slot: ["slot/getting-started"],
  // vrf: ["vrf/overview", "vrf/getting-started"],
};

module.exports = sidebars;
