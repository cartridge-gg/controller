import { ControllerThemePreset, defaultPresets } from "@cartridge/controller";
import { useThemeEffect } from "@cartridge/ui-next";
import { hexToHsl } from "@cartridge/utils";
import { createContext, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type ColorScheme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultScheme?: ColorScheme;
  storageKey?: string;
};

type ThemeProviderContextType = {
  colorScheme: ColorScheme;
  setColorScheme: (colorMode: ColorScheme) => void;
  theme: ControllerThemePreset;
};

const initialState: ThemeProviderContextType = {
  colorScheme: "system",
  setColorScheme: () => null,
  theme: defaultPresets.cartridge as ControllerThemePreset,
};

export const ThemeContext =
  createContext<ThemeProviderContextType>(initialState);

export function ThemeProvider({
  children,
  defaultScheme = "system",
  storageKey = "vite-ui-colorScheme",
  ...props
}: ThemeProviderProps) {
  const [searchParams] = useSearchParams();
  const colorSchemeParam =
    (searchParams.get("colorMode") as ColorScheme) || null;
  if (
    colorSchemeParam &&
    !["light", "dark", "system"].includes(colorSchemeParam)
  ) {
    throw new Error(
      `Unknown colorScheme query param is provided: ${colorSchemeParam}`,
    );
  }

  const [colorScheme, setColorSchemeRaw] = useState<ColorScheme>(
    () =>
      colorSchemeParam ||
      (localStorage.getItem(storageKey) as ColorScheme) ||
      defaultScheme,
  );

  const setColorScheme = useCallback(
    (colorScheme: ColorScheme) => {
      localStorage.setItem(storageKey, colorScheme);
      setColorSchemeRaw(colorScheme);
    },
    [storageKey],
  );
  const [theme, setTheme] = useState<ControllerThemePreset>(initialState.theme);
  const themeParam = searchParams.get("theme");

  useEffect(() => {
    if (!themeParam) return;

    setTheme(JSON.parse(decodeURIComponent(themeParam)));
  }, [themeParam]);

  useThemeEffect({ theme, assetUrl: import.meta.env.VITE_KEYCHAIN_URL });

  useEffect(() => {
    const appliedColorMode = document.documentElement.className.includes("dark")
      ? "dark"
      : "light";

    document.documentElement.style.setProperty(
      "--theme-icon-url",
      `url("${import.meta.env.VITE_KEYCHAIN_URL}${theme.icon}")`,
    );
    const coverUrl =
      typeof theme.cover === "string"
        ? `url("${import.meta.env.VITE_KEYCHAIN_URL}${theme.cover}")`
        : `url("${import.meta.env.VITE_KEYCHAIN_URL}${
            theme.cover[appliedColorMode]
          }")`;
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

  const value = {
    colorScheme,
    setColorScheme,
    theme,
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
