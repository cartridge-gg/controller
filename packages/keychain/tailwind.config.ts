import { cartridgeTWPreset } from "@cartridge/ui-next/preset";
import { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{html,ts,tsx}",
    "./node_modules/@cartridge/ui-next/dist/**/*.{js,jsx}",
  ],
  presets: [cartridgeTWPreset],
  theme: {
    extend: {
      width: {
        desktop: "432px",
      },
      height: {
        desktop: "600px",
      },
    },
  },
};

export default config;
