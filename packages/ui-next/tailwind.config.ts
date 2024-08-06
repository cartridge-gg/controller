import type { Config } from "tailwindcss";
import { cartridgeTWPreset } from "./src";

const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  prefix: "",
  presets: [cartridgeTWPreset],
} satisfies Config;

export default config;
