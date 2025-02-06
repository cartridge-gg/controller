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
        DEFAULT: "hsl(var(--background))",
        100: "hsl(var(--background-100))",
        200: "hsl(var(--background-200))",
        300: "hsl(var(--background-300))",
        400: "hsl(var(--background-400))",
      },
      foreground: {
        DEFAULT: "hsl(var(--foreground))",
        100: "hsl(var(--foreground-100))",
        200: "hsl(var(--foreground-200))",
        300: "hsl(var(--foreground-300))",
        400: "hsl(var(--foreground-400))",
      },
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: "hsl(var(--secondary))",
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        100: "hsl(var(--destructive-100))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      border: "hsl(var(--background)/0.12)",
      input: "hsl(var(--background-200)/0.12)",
      spacer: "hsl(var(--spacer))",
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
