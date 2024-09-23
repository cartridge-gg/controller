import { createContext, useCallback, useState } from "react";
import { useQueryParams } from "./hooks";

type ColorScheme = "dark" | "light" | "system";

type ColorSchemeProviderProps = {
  children: React.ReactNode;
  defaultScheme?: ColorScheme;
  storageKey?: string;
};

type ColorSchemeProviderState = {
  colorScheme: ColorScheme;
  setColorScheme: (colorMode: ColorScheme) => void;
};

const initialState: ColorSchemeProviderState = {
  colorScheme: "system",
  setColorScheme: () => null,
};

export const ColorSchemeProviderContext =
  createContext<ColorSchemeProviderState>(initialState);

export function ColorSchemeProvider({
  children,
  defaultScheme = "system",
  storageKey = "vite-ui-colorScheme",
  ...props
}: ColorSchemeProviderProps) {
  const params = useQueryParams();
  const colorSchemeParam = (params.get("colorMode") as ColorScheme) || null;
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
    <ColorSchemeProviderContext.Provider {...props} value={value}>
      {children}
    </ColorSchemeProviderContext.Provider>
  );
}
