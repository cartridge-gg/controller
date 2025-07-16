import { createContext } from "react";
import { defaultTheme, ControllerTheme } from "@cartridge/presets";

export type ColorScheme = "dark" | "light" | "system";

type ThemeProviderContextType = {
  colorScheme: ColorScheme;
  setColorScheme: (colorMode: ColorScheme) => void;
  theme: ControllerTheme;
};

export const initialState: ThemeProviderContextType = {
  colorScheme: "dark",
  setColorScheme: () => null,
  theme: defaultTheme,
};

export const ThemeContext =
  createContext<ThemeProviderContextType>(initialState);
