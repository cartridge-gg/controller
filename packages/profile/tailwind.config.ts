import { cartridgeTWPreset } from "@cartridge/ui/preset";
import { Config } from "tailwindcss";

const config = {
  content: [
    "./src/**/*.{html,ts,tsx}",
    "./node_modules/@cartridge/ui/dist/**/*.{js,jsx}",
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
} satisfies Config;

export default config;
