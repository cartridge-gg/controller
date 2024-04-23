import { Config } from "tailwindcss";
import { cartridgeTWPlugin } from "@cartridge/ui-next";

const config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@cartridge/ui-next/dist/**/*.js",
  ],
  prefix: "",
  plugin: [cartridgeTWPlugin],
} satisfies Config;

export default config;
