import config from "@cartridge/eslint";

export default [
  ...config,
  {
    ignores: [".next/", "node_modules/", "out/"],
  },
];
