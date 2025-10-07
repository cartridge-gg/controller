import config from "@cartridge/eslint";
export default [
  ...config,
  { ignores: ["public/**", "src/utils/api/generated.ts"] },
];
