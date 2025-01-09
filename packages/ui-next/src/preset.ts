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
      border: "hsl(var(--border)/0.12)",
      input: "hsl(var(--input)/0.12)",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      tertiary: {
        DEFAULT: "hsl(var(--tertiary))",
        foreground: "hsl(var(--tertiary-foreground))",
      },
      quaternary: {
        DEFAULT: "hsl(var(--quaternary))",
        foreground: "hsl(var(--quaternary-foreground))",
      },
      quinary: {
        DEFAULT: "hsl(var(--quinary))",
        foreground: "hsl(var(--quinary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
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
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      spacer: {
        DEFAULT: "hsl(var(--spacer))",
      },
      info: {
        DEFAULT: "hsl(var(--info))",
        foreground: "hsl(var(--info-foreground))",
        icon: "hsl(var(--info-icon))",
      },
      warning: {
        DEFAULT: "hsl(var(--warning))",
        foreground: "hsl(var(--warning-foreground))",
        icon: "hsl(var(--warning-icon))",
      },
      error: {
        DEFAULT: "hsl(var(--error))",
        foreground: "hsl(var(--error-foreground))",
        icon: "hsl(var(--error-icon))",
      },
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
