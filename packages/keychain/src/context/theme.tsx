import { ControllerTheme } from "@cartridge/presets";
import { createContext } from "react";

export const ControllerThemeContext = createContext<
  ControllerTheme | undefined
>(undefined);
