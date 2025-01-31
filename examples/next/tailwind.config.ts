import { cartridgeTWPreset } from "@cartridge/ui/preset";
import { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@cartridge/ui/dist/**/*.{js,jsx}",
  ],
  presets: [cartridgeTWPreset],
};

export default config;
