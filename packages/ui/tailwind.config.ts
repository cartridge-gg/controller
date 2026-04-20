import type { Config } from "tailwindcss";
import { cartridgeTWPreset } from "./src/preset";

const config = {
  darkMode: ["class", "class"],
  content: ["./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  presets: [cartridgeTWPreset],
  theme: {
    extend: {
      placeholderColor: {
        primary: "#808080",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "100% 0%" },
          "20%": { backgroundPosition: "-100% 0%" },
          "100%": { backgroundPosition: "-100% 0%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
} satisfies Config;

export default config;
