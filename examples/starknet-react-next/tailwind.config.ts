import { cartridgeTWPreset } from "@cartridge/ui-next/preset";
import { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@cartridge/ui-next/dist/**/*.{js,jsx}",
  ],
  presets: [cartridgeTWPreset],
};

export default config;
