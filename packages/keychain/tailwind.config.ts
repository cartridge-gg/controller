import { cartridgeTWPreset } from "@cartridge/ui/preset";
import { Config } from "tailwindcss";
// @ts-expect-error nativewind is not typed
import nativewind from "nativewind/preset";

const config: Config = {
  content: [
    "./src/**/*.{html,ts,tsx}",
    "./node_modules/@cartridge/ui/dist/**/*.{js,jsx}",
  ],
  presets: [nativewind, cartridgeTWPreset],
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
