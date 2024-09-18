import { createContext, useEffect, useState } from "react";
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

  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    () =>
      colorSchemeParam ||
      (localStorage.getItem(storageKey) as ColorScheme) ||
      defaultScheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (colorScheme === "system") {
      const systemScheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemScheme);
      return;
    }

    root.classList.add(colorScheme);
  }, [colorScheme]);

  const value = {
    colorScheme,
    setColorScheme: (colorScheme: ColorScheme) => {
      localStorage.setItem(storageKey, colorScheme);
      setColorScheme(colorScheme);
    },
  };

  return (
    <ColorSchemeProviderContext.Provider {...props} value={value}>
      {children}
    </ColorSchemeProviderContext.Provider>
  );
}
