import { defaultTheme, ControllerTheme, loadConfig } from "@cartridge/presets";
import { useThemeEffect } from "@cartridge/ui";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  ColorScheme,
  ThemeContext,
  initialState,
} from "#profile/context/theme";

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
  const [loading, setLoading] = useState<boolean>(false);
  const themeParam = searchParams.get("theme");
  const presetParam = searchParams.get("preset");
  const origin = window.location.origin;

  useEffect(() => {
    // Handle theme from URL param
    if (themeParam) {
      const decodedPreset = decodeURIComponent(themeParam);
      try {
        const parsedTheme = JSON.parse(decodedPreset) as ControllerTheme;
        setTheme(parsedTheme);
      } catch {
        setLoading(true);
        loadConfig(decodedPreset)
          .then((config) => {
            if (config?.theme) {
              setTheme(config.theme || defaultTheme);
            } else {
              setTheme(defaultTheme);
            }
          })
          .catch(() => {
            setTheme(defaultTheme);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }

    // Handle theme from preset param
    if (presetParam) {
      setLoading(true);
      loadConfig(presetParam)
        .then((config) => {
          if (config?.theme) {
            setTheme(config.theme || defaultTheme);
          } else {
            setTheme(defaultTheme);
          }
        })
        .catch(() => {
          setTheme(defaultTheme);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [themeParam, presetParam, origin]);

  useThemeEffect({ theme, assetUrl: import.meta.env.VITE_KEYCHAIN_URL });

  const value = {
    colorScheme,
    setColorScheme,
    theme,
    loading,
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
