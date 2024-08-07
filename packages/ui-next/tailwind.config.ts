import type { Config } from "tailwindcss";
import { cartridgeTWPreset } from "./src/preset";

const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  presets: [cartridgeTWPreset],
} satisfies Config;

export default config;
