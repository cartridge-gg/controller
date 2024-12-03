import {
  ControllerTheme,
  defaultTheme,
  verifiedConfigs,
} from "@cartridge/controller";
import { useThemeEffect } from "@cartridge/ui-next";
import { createContext, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useConnection } from "@/hooks/context";

type ColorScheme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultScheme?: ColorScheme;
  storageKey?: string;
};

type ThemeProviderContextType = {
  colorScheme: ColorScheme;
  setColorScheme: (colorMode: ColorScheme) => void;
  theme: ControllerTheme;
};

const initialState: ThemeProviderContextType = {
  colorScheme: "system",
  setColorScheme: () => null,
  theme: defaultTheme,
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
  const [theme, setTheme] = useState<ControllerTheme>(initialState.theme);
  const themeParam = searchParams.get("theme");
  const { origin } = useConnection();

  useEffect(() => {
    if (!themeParam) return;
    const val = decodeURIComponent(themeParam);

    if (
      typeof val === "string" &&
      val in verifiedConfigs &&
      verifiedConfigs[val].theme &&
      (origin.startsWith("http://localhost") ||
        verifiedConfigs[val].origin === origin)
    ) {
      setTheme(verifiedConfigs[val].theme);
      return;
    }

    setTheme(JSON.parse(val));
  }, [themeParam, origin]);

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
