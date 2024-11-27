import { useEffect } from "react";
import { hexToHsl } from "@cartridge/utils";

export function useThemeEffect({
  theme,
  assetUrl,
}: {
  theme: ControllerThemePreset;
  assetUrl: string;
}) {
  useEffect(() => {
    const appliedColorMode = document.documentElement.className.includes("dark")
      ? "dark"
      : "light";

    document.documentElement.style.setProperty(
      "--theme-icon-url",
      `url("${assetUrl}${theme.icon}")`,
    );
    const coverUrl =
      typeof theme.cover === "string"
        ? `url("${assetUrl}${theme.cover}")`
        : `url("${assetUrl}${theme.cover[appliedColorMode]}")`;
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
  }, [theme, assetUrl]);
}

// dup of @cartridge/controller/types
type ColorMode = "light" | "dark";
type ControllerTheme = {
  id: string;
  name: string;
  icon: string;
  cover: ThemeValue<string>;
  colorMode: ColorMode;
};
type ControllerThemePreset = Omit<ControllerTheme, "colorMode"> & {
  colors?: ControllerColors;
};
type ControllerColors = {
  primary?: ControllerColor;
  primaryForeground?: ControllerColor;
};
type ControllerColor = ThemeValue<string>;
type ThemeValue<T> =
  | T
  | {
      dark: T;
      light: T;
    };
