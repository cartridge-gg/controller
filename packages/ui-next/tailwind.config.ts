import type { Config } from "tailwindcss";
import { cartridgeTWPlugin } from "./src/plugin";

const config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  prefix: "",
  plugins: [cartridgeTWPlugin],
} satisfies Config;

export default config;
