import { createContext, useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";

type ColorScheme = "dark" | "light" | "system";

type ColorSchemeProviderProps = {
  children: React.ReactNode;
  defaultScheme?: ColorScheme;
  storageKey?: string;
};

type ColorSchemeContextType = {
  colorScheme: ColorScheme;
  setColorScheme: (colorMode: ColorScheme) => void;
};

const initialState: ColorSchemeContextType = {
  colorScheme: "system",
  setColorScheme: () => null,
};

export const ColorSchemeContext =
  createContext<ColorSchemeContextType>(initialState);

export function ColorSchemeProvider({
  children,
  defaultScheme = "system",
  storageKey = "vite-ui-colorScheme",
  ...props
}: ColorSchemeProviderProps) {
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

  const value = {
    colorScheme,
    setColorScheme,
  };

  return (
    <ColorSchemeContext.Provider {...props} value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}
