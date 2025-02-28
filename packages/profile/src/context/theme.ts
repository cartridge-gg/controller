import { createContext } from "react";
import { defaultTheme, ControllerTheme } from "@cartridge/controller";

export type ColorScheme = "dark" | "light" | "system";

type ThemeProviderContextType = {
  colorScheme: ColorScheme;
  setColorScheme: (colorMode: ColorScheme) => void;
  theme: ControllerTheme;
};

export const initialState: ThemeProviderContextType = {
  colorScheme: "system",
  setColorScheme: () => null,
  theme: defaultTheme,
};

export const ThemeContext =
  createContext<ThemeProviderContextType>(initialState);
