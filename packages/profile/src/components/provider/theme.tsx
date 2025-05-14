import {
  defaultTheme,
  controllerConfigs,
  ControllerTheme,
} from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useConnection } from "#hooks/context";
import { ColorScheme, ThemeContext, initialState } from "#context/theme";

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultScheme?: ColorScheme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultScheme = "dark",
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
  const [theme, setTheme] = useState<ControllerTheme>(initialState.theme);
  const themeParam = searchParams.get("theme");
  const presetParam = searchParams.get("preset");
  const { origin } = useConnection();

  useEffect(() => {
    // Handle theme from URL param
    if (themeParam) {
      const decodedPreset = decodeURIComponent(themeParam);
      try {
        const parsedTheme = JSON.parse(decodedPreset) as ControllerTheme;
        setTheme(parsedTheme);
      } catch {
        setTheme(controllerConfigs[decodedPreset].theme || defaultTheme);
      }
    }

    // Handle theme from preset param
    if (presetParam && presetParam in controllerConfigs) {
      setTheme(controllerConfigs[presetParam].theme || defaultTheme);
    }
  }, [themeParam, presetParam, origin]);

  useThemeEffect({ theme, assetUrl: import.meta.env.VITE_KEYCHAIN_URL });

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
