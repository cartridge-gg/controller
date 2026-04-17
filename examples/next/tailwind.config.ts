import { cartridgeTWPreset } from "@cartridge/controller-ui/preset";
import { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@cartridge/controller-ui/dist/**/*.{js,jsx}",
  ],
  presets: [cartridgeTWPreset],
};

export default config;
