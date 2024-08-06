const { cartridgeTWPreset } = require("../../packages/ui-next/src/preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  presets: [cartridgeTWPreset],
};
