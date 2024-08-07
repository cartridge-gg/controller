const { cartridgeTWPreset } = require("../../packages/ui-next/src/preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@cartridge/ui-next/**/*.{js,jsx}",
  ],
  presets: [cartridgeTWPreset],
};
