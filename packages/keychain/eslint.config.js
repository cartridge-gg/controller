import config from "@cartridge/eslint";
export default [
  ...config,
  { ignores: ["public/**", "src/utils/api/generated.ts"] },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];
