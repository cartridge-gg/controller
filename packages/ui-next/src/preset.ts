import { Config } from "tailwindcss";
import twAnimate from "tailwindcss-animate";
import defaultTheme from "tailwindcss/defaultTheme";

export const cartridgeTWPreset: Partial<Config> = {
  darkMode: "selector",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      background: {
        DEFAULT: "var(--background-100)",
        100: "var(--background-100)",
        200: "var(--background-200)",
        300: "var(--background-300)",
        400: "var(--background-400)",
        500: "var(--background-500)",
      },
      translucent: {
        DEFAULT: "var(--translucent-100)",
        100: "var(--translucent-100)",
        200: "var(--translucent-200)",
        300: "var(--translucent-300)",
      },
      spacer: {
        DEFAULT: "var(--spacer-100)",
        100: "var(--spacer-100)",
      },
      foreground: {
        DEFAULT: "var(--foreground-100)",
        100: "var(--foreground-100)",
        200: "var(--foreground-200)",
        300: "var(--foreground-300)",
        400: "var(--foreground-400)",
      },
      primary: {
        DEFAULT: "var(--primary-100)",
        100: "var(--primary-100)",
        200: "var(--primary-200)",
        foreground: "var(--spacer-100)",
      },
      secondary: {
        DEFAULT: "var(--secondary-100)",
        100: "var(--secondary-100)",
      },
      destructive: {
        DEFAULT: "var(--destructive-100)",
        100: "var(--destructive-100)",
        foreground: "var(--spacer-100)",
      },
      constructive: {
        DEFAULT: "var(--constructive-100)",
        100: "var(--constructive-100)",
        foreground: "var(--spacer-100)",
      },
      // TODO: Should not be used
      muted: {
        DEFAULT: "var(--muted)",
        foreground: "var(--muted-foreground)",
      },
      accent: {
        DEFAULT: "var(--accent)",
        foreground: "var(--accent-foreground)",
      },
      border: "var(--background-100)/0.12",
      input: "var(--background-300)/0.12",
    },
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["IBM Plex Mono", ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        ["2xs"]: "10px",
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [twAnimate],
};
