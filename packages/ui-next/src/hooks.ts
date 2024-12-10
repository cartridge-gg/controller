import { useEffect } from "react";
import { hexToHsl } from "@cartridge/utils";

export function useThemeEffect({ theme }: { theme: ControllerTheme }) {
  useEffect(() => {
    if (!theme) return;

    const appliedColorMode = document.documentElement.className.includes("dark")
      ? "dark"
      : "light";

    document.documentElement.style.setProperty(
      "--theme-icon-url",
      `url("${theme.icon}")`,
    );
    const coverUrl =
      typeof theme.cover === "string"
        ? `url("${theme.cover}")`
        : `url("${theme.cover[appliedColorMode]}")`;
    document.documentElement.style.setProperty("--theme-cover-url", coverUrl);

    if (!theme.colors) return;

    if (theme.colors?.primary) {
      const val =
        typeof theme.colors.primary === "string"
          ? theme.colors?.primary
          : theme.colors?.primary[appliedColorMode];
      document.documentElement.style.setProperty("--primary", hexToHsl(val));
    }

    if (theme.colors?.primaryForeground) {
      const val =
        typeof theme.colors.primaryForeground === "string"
          ? theme.colors?.primaryForeground
          : theme.colors?.primaryForeground[appliedColorMode];
      document.documentElement.style.setProperty(
        "--primary-foreground",
        hexToHsl(val),
      );
    }
  }, [theme]);
}

// dup of @cartridge/controller/types
export type ControllerThemeOption = string | ControllerTheme;

export type ControllerTheme = {
  name: string;
  icon: string;
  cover: ThemeValue<string>;
  colors?: ControllerColors;
};

export type ControllerColors = {
  primary?: ControllerColor;
  primaryForeground?: ControllerColor;
};

export type ControllerColor = ThemeValue<string>;

export type ThemeValue<T> = T | { dark: T; light: T };
