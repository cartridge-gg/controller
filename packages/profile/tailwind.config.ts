import { cartridgeTWPreset } from "@cartridge/ui-next/preset";
import { Config } from "tailwindcss";

const config = {
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
      minHeight: {
        desktop: "475px",
      },
      maxHeight: {
        desktop: "600px",
      },
    },
  },
} satisfies Config;

export default config;
